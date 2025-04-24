const pool = require('./db');

async function basicCrud() {
  let conn;
  try {
    conn = await pool.getConnection();

    const studentId = 'S10810001';
    const newName = '王小明';

    // 先查詢是否有這位學生
    const rows = await conn.query('SELECT * FROM STUDENT WHERE Student_ID = ?', [studentId]);

    if (rows.length === 0) {
      // 若不存在，執行 INSERT
      let sql = 'INSERT INTO STUDENT (Student_ID, Name, Gender, Email, Department_ID) VALUES (?, ?, ?, ?, ?)';
      await conn.query(sql, [studentId, '王曉明', 'M', 'wang@example.com', 'CS001']);
      console.log('✅ 已新增一筆學生資料');
    } else {
      // 若存在，執行 UPDATE
      let sql = 'UPDATE STUDENT SET Name = ? WHERE Student_ID = ?';
      await conn.query(sql, [newName, studentId]);
      console.log('✅ 已更新學生名稱');
    }

    // 查詢同系學生
    const queryResult = await conn.query('SELECT * FROM STUDENT WHERE Department_ID = ?', ['CS001']);
    console.log('📄 查詢結果：', queryResult);

    // 最後刪除該學生
    await conn.query('DELETE FROM STUDENT WHERE Student_ID = ?', [studentId]);
    console.log('🗑️ 已刪除該學生');

  } catch (err) {
    console.error('❌ 操作失敗：', err);
  } finally {
    if (conn) await conn.release();
  }
}

basicCrud();
