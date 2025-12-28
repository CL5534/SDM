import mysql from 'mysql2';
import bcrypt from 'bcryptjs';

// DB 연결 설정
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root', 
  port: 3306,
  database: 'CDM',  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('DB 연결 실패:', err);
  } else {
    console.log('DB 연결 성공');
    connection.release();
  }
});



// 회원가입 (비밀번호 해시 처리 및 에러 처리 개선)
export const signup = async (req, res) => {
  const {email, password, name} = req.body;
  const ADMIN_DOMAIN = "cdm.com";
 
  try {
      // 이메일 중복 확인
      const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
      }

      // 비밀번호 해시 처리
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 권한
      const role_id = email.endsWith(ADMIN_DOMAIN) ? 1 : 2; // 도메인에 따라 권한 부여 (1: 관리자, 2: 점검자)

      // DB에 사용자 저장
      const query = "INSERT INTO users (email, password, name, role_id) VALUES (?, ?, ?, ?)";
      await db.promise().query(query, [email, hashedPassword, name, role_id]);
      console.log(`회원가입 성공: ${email} (권한: ${role_id})`);
      res.status(201).json({ message: "회원가입 성공" });
      } catch (error) {
      console.error('회원가입 실패:', error);
      res.status(500).json({ message: "서버 오류로 회원가입에 실패했습니다." });
    }
};


// 로그인 (비밀번호 비교 및 role_id 포함)
export const login = async (req, res) => {
  const {email, password} = req.body;
  console.log ("📝 [백엔드] 로그인 요청 도착! 데이터:", { email, password }); // 비밀번호는 로그에서 제외 (보안)
    try {
        // DB에서 해당 이메일 사용자 조회
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
          return res.status(401).json({ message: "가입되지 않은 이메일입니다." });
        }

        const user = users[0];

        // 비밀번호 비교 (입력값 vs DB 해시값)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
        }

        // 로그인 성공 시 세션에 사용자 정보 저장
        req.session.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role_id: user.role_id
        };

        console.log(`✅ 로그인 성공: ${user.name}님`);
        res.json({ message: "로그인 성공", user: req.session.user });

      } catch (error) {
        console.error('로그인 서버 오류:', error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
      }
    };

// 로그아웃 (세션 파기)
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "로그아웃 실패" });
    }
    res.clearCookie("connect.sid"); // 세션 쿠키 삭제
    res.json({ message: "로그아웃 성공" });
  });
};

// 세션 확인 함수 (프론트엔드 /me 요청에 대응)
export const checkSession = (req, res) => {
  // 사용자가 로그인 상태인지(세션이 있는지) 확인합니다.
  if (req.session && req.session.user) {
    console.log(`🔍 [세션확인] 로그인 유지 중: ${req.session.user.name}`);
    // 프론트엔드 App.js의 data.user와 형식을 맞춥니다.
    res.json({ isLoggedIn: true, user: req.session.user }); 
  } else {
    console.log(`🔍 [세션확인] 로그인 정보 없음`);
    res.status(401).json({ isLoggedIn: false, user: null });
  }
};

// 사용자 목록 조회 (관리자용)
export const getUsers = async (req, res) => {
  try {
    // 비밀번호를 제외한 사용자 정보 조회
    const [users] = await db.promise().query('SELECT id, email, name, role_id, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 사용자 권한 수정 (관리자용)
export const updateRole = async (req, res) => {
  const { id, role_id } = req.body;
  try {
    await db.promise().query('UPDATE users SET role_id = ? WHERE id = ?', [role_id, id]);
    res.json({ message: "권한 수정 성공" });
  } catch (error) {
    console.error('권한 수정 실패:', error);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 사용자 삭제 (관리자용)
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: "사용자가 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error('사용자 삭제 실패:', error);
    res.status(500).json({ message: "서버 오류로 삭제에 실패했습니다." });
  }
};

// 사용자 비밀번호 수정 (관리자용)
export const updatePassword = async (req, res) => {
  const { id, newPassword } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await db.promise().query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    res.json({ message: "비밀번호가 성공적으로 수정되었습니다." });
  } catch (error) {
    console.error('비밀번호 수정 실패:', error);
    res.status(500).json({ message: "서버 오류로 비밀번호 수정에 실패했습니다." });
  }
};