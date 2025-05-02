// transactionExample.js
const pool = require('./db'); // 使用 mariadb.createPool 建立的 pool

async function doTransaction() {
  let conn;
  try {
    conn = await pool.getConnection();

    const studentId = 'S10741001';
    const newDepartment = 'EE001';

    // 🔍 檢查是否有此學生
    const checkResult = await conn.query(
      'SELECT Name, Department_ID FROM STUDENT WHERE Student_ID = ?',
      [studentId]
    );

    console.log('🔍 查詢結果：', checkResult);

    if (!Array.isArray(checkResult) || checkResult.length === 0) {
      console.log(`❌ 查無此學生：${studentId}，終止交易`);
      return;
    }

    const studentName = checkResult[0].Name;
    const originalDepartment = checkResult[0].Department_ID;
    console.log(`✅ 找到學生：${studentName}，原系所為：${originalDepartment}`);

    // ✅ 開始交易
    await conn.beginTransaction();

    // ✅ 執行更新
    const updateStudent = 'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?';
    await conn.query(updateStudent, [newDepartment, studentId]);

    // ✅ 提交交易
    await conn.commit();
    console.log('✅ 交易成功，已提交');

    // 🔁 查詢更新後的系所
    const resultRows = await conn.query(
      'SELECT Name, Department_ID FROM STUDENT WHERE Student_ID = ?',
      [studentId]
    );

    if (resultRows.length > 0) {
      const updated = resultRows[0];
      console.log(`✅ 學生：${updated.Name} 系所由 ${originalDepartment} → ${updated.Department_ID}`);
    } else {
      console.log(`⚠️ 查不到更新後的學生資料`);
    }

  } catch (err) {
    if (conn) await conn.rollback();
    console.error('❌ 交易失敗，已回滾：', err);
  } finally {
    if (conn) conn.release();
  }
}

doTransaction();
