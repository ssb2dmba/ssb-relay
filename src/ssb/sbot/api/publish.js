import pool from "../../../repository/pool.js";

module.exports = function implementation(db) {
  async function insertMessage(pool, message) {
    const text = `
      INSERT INTO message (message)
      VALUES ($1) ON CONFLICT DO NOTHING
    `;

    let result;
    const client = await pool.connect();
    try {
      result = await client.query(text, [message]);
    } finally {
      client.release();
    }
    return result;
  }

  db.add = (msg, cb) => {
    db.queue(msg, async (err, data) => {
      if (err) {
        cb(err);
      } else {
        insertMessage(pool, data);
        setTimeout(() => {
          // setTimeout help test works ...
          cb(null, data);
        }, 50);
      }
    });
  };

  return db;
};
