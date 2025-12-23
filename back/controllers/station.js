import mysql from 'mysql2';

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root', 
  port: 3306,
  database: 'CDM',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); 

// 1. 전체 충전소 목록 조회
export const getStations = async (req, res) => {
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
    console.error('조회 실패:', error);
    res.status(500).json({ message: "데이터 로드 오류" });
  }
};

// 2. 상태 업데이트
export const updateStationStatus = async (req, res) => {
  const { id } = req.params; 
  const { status_id, failure_reason_id } = req.body; 
  try {
    const query = `
      UPDATE stations_address 
      SET status_id = ?, failure_reason_id = ? 
      WHERE id = (SELECT stations_address_id FROM stations WHERE id = ?)
    `;
    await db.query(query, [status_id, failure_reason_id, id]);
    res.json({ message: "성공적으로 업데이트되었습니다." });
  } catch (error) {
    console.error('업데이트 실패:', error);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 3. 새로운 충전소 등록
export const createStation = async (req, res) => {
  const { id, name, address, detail_location, status_id, failure_reason_id } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction(); 

    const [addressResult] = await conn.query(
      "INSERT INTO stations_address (name, address, detail_location, status_id, failure_reason_id) VALUES (?, ?, ?, ?, ?)",
      [name, address, detail_location, status_id, failure_reason_id]
    );
    
    const addressId = addressResult.insertId;

    await conn.query(
      "INSERT INTO stations (id, stations_address_id) VALUES (?, ?)",
      [id, addressId]
    );

    await conn.commit(); 
    res.status(201).json({ message: "충전소가 성공적으로 등록되었습니다." });
  } catch (error) {
    await conn.rollback(); 
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: "이미 존재하는 기기 번호(No.)입니다." });
    } else {
      res.status(500).json({ message: "서버 오류" });
    }
  } finally {
    conn.release();
  }
};

// 4. 충전소 삭제
export const deleteStation = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [station] = await conn.query("SELECT stations_address_id FROM stations WHERE id = ?", [id]);
    if (station.length === 0) {
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
};

// --- ★ 고장 원인 관리 로직 추가 ★ ---

// 5. 고장 원인 목록 조회 (GET)
export const getFailureReasons = async (req, res) => {
  try {
    // DB의 reason_text를 프론트에서 쓰는 'name'이라는 이름으로 가져옵니다.
    const query = "SELECT id, reason_text AS name FROM failure_reasons ORDER BY id ASC";
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('고장 원인 조회 실패:', error);
    res.status(500).json({ message: "고장 원인 목록 로드 실패" });
  }
};

// 6. 새로운 고장 원인 등록 (POST)
export const createFailureReason = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "내용을 입력해주세요." });

  try {
    // DB 컬럼명인 reason_text와 status_id에 맞춰 저장합니다.
    const query = "INSERT INTO failure_reasons (reason_text, status_id) VALUES (?, 3)";
    const [result] = await db.query(query, [name]);
    
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error('고장 원인 등록 실패:', error);
    res.status(500).json({ message: "서버 오류" });
  }
};