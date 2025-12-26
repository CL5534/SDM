import mysql from "mysql2";

const db = mysql
  .createPool({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    port: 3306,
    database: "CDM",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

// 전체 충전소 목록 조회
export async function getStations(req, res) {
  try {
    const query = `
      SELECT s.id, a.name, a.address, a.detail_location, a.status_id, a.failure_reason_id 
      FROM stations s
      JOIN stations_address a ON s.stations_address_id = a.id
      ORDER BY s.id ASC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("조회 실패:", error);
    res.status(500).json({ message: "데이터 로드 오류" });
  }
}

// 상태 업데이트 (+ maintenance_history 저장)
export async function updateStationStatus(req, res) {
  const { id } = req.params;
  const { status_id, failure_reason_id } = req.body;

  // 세션 로그인 확인 (user_id NOT NULL 때문에 필수)
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  const userId = Number(req.session.user.id);

  // 빈 값이면 null로 저장
  let newFailureReasonId = failure_reason_id;
  if (newFailureReasonId === "" || newFailureReasonId === undefined) {
    newFailureReasonId = null;
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1) station의 stations_address_id + 변경 전 값 조회 (FOR UPDATE 잠금)
    const selectSql = `
      SELECT 
        s.stations_address_id,
        a.status_id AS old_status_id,
        a.failure_reason_id AS old_failure_reason_id
      FROM stations s
      JOIN stations_address a ON s.stations_address_id = a.id
      WHERE s.id = ?
      FOR UPDATE
    `;
    const [rows] = await conn.query(selectSql, [id]);

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "해당 충전소를 찾을 수 없습니다." });
    }

    const old = rows[0];

    // 변경 여부 판단(같은 값이면 히스토리 저장 안 함)
    const isChanged =
      Number(old.old_status_id) !== Number(status_id) ||
      String(old.old_failure_reason_id ?? "") !== String(newFailureReasonId ?? "");

    // stations_address 업데이트
    const updateSql = `
      UPDATE stations_address
      SET status_id = ?, failure_reason_id = ?
      WHERE id = ?
    `;
    await conn.query(updateSql, [status_id, newFailureReasonId, old.stations_address_id]);

    // maintenance_history 저장 (변경된 경우에만)
    if (isChanged) {
      const insertSql = `
        INSERT INTO maintenance_history
          (user_id, station_id, new_status_id, new_failure_reason_id)
        VALUES (?, ?, ?, ?)
      `;
      await conn.query(insertSql, [userId, id, status_id, newFailureReasonId]);
    }

    await conn.commit();
    res.json({ message: "성공적으로 업데이트되었습니다.", saved_history: isChanged });
  } catch (error) {
    await conn.rollback();
    console.error("업데이트 실패:", error);
    res.status(500).json({ message: "서버 오류" });
  } finally {
    conn.release();
  }
}

// 새로운 충전소 등록
export async function createStation(req, res) {
  const { id, name, address, detail_location, status_id, failure_reason_id } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [addressResult] = await conn.query(
      "INSERT INTO stations_address (name, address, detail_location, status_id, failure_reason_id) VALUES (?, ?, ?, ?, ?)",
      [name, address, detail_location, status_id, failure_reason_id]
    );

    const addressId = addressResult.insertId;

    await conn.query("INSERT INTO stations (id, stations_address_id) VALUES (?, ?)", [id, addressId]);

    await conn.commit();
    res.status(201).json({ message: "충전소가 성공적으로 등록되었습니다." });
  } catch (error) {
    await conn.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "이미 존재하는 기기 번호(No.)입니다." });
    } else {
      res.status(500).json({ message: "서버 오류" });
    }
  } finally {
    conn.release();
  }
}

// 충전소 삭제
export async function deleteStation(req, res) {
  const { id } = req.params;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [station] = await conn.query("SELECT stations_address_id FROM stations WHERE id = ?", [id]);
    if (station.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "해당 충전소를 찾을 수 없습니다." });
    }

    const addressId = station[0].stations_address_id;

    await conn.query("DELETE FROM stations WHERE id = ?", [id]);
    await conn.query("DELETE FROM stations_address WHERE id = ?", [addressId]);

    await conn.commit();
    res.json({ message: "충전소가 삭제되었습니다." });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ message: "서버 오류" });
  } finally {
    conn.release();
  }
}


// 고장 원인 목록 조회 (GET)
export async function getFailureReasons(req, res) {
  try {
    const query = "SELECT id, reason_text AS name FROM failure_reasons ORDER BY id ASC";
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("고장 원인 조회 실패:", error);
    res.status(500).json({ message: "고장 원인 목록 로드 실패" });
  }
}

// 새로운 고장 원인 등록 (POST)
export async function createFailureReason(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "내용을 입력해주세요." });

  try {
    const query = "INSERT INTO failure_reasons (reason_text, status_id) VALUES (?, 3)";
    const [result] = await db.query(query, [name]);

    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error("고장 원인 등록 실패:", error);
    res.status(500).json({ message: "서버 오류" });
  }
}

// 내 작업 내역(충전소 ID 목록) 조회 - maintenance_history 기반
export async function getMyHistory(req, res) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }

  const userId = Number(req.session.user.id);

  try {
    const query = `
      SELECT station_id
      FROM maintenance_history
      WHERE user_id = ?
      GROUP BY station_id
      ORDER BY MAX(updated_at) DESC
    `;
    const [rows] = await db.query(query, [userId]);

    const stationIds = rows.map(function (r) {
      return r.station_id;
    });

    res.json(stationIds); // 예: [3, 7, 12]
  } catch (error) {
    console.error("내 작업 내역 조회 실패:", error);
    res.status(500).json({ message: "서버 오류" });
  }
}
