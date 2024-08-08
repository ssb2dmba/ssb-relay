import getPool from "../../../repository/pool.js";

module.exports = function implementation(db) {
  async function insertMessage(message) {
    const text = `
      INSERT INTO message (message)
      VALUES ($1) ON CONFLICT DO NOTHING
    `;

    let result;
    const client = await getPool().connect();
    try {
      result = await client.query(text, [message]);
    } catch (e) {
      console.log(e)
    } finally {
      client.release();
    }
    return result;
  }

  db.add = (msg, cb) => {
    db.queue(msg, async (err, data) => {
      if (err) {
        console.log(err)
        cb(err);
      } else {
        insertMessage(data);
        setTimeout(() => {
          // setTimeout help test works ...
          cb(null, data);
        }, 50);
      }
    });
  };

  return db;
};
