/*
 * This file is part of the ssb-postgres distribution (https://github.com/ssb2dmba/ssb-postgres).
 * Copyright (c) 2023 DMBA Emmanuel Florent.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = function implementation(db) {

    async function getRoot(pool) {
        const sql = "select * from root";
        return await pool.query(sql);
    }

    async function clearRoot(pool) {
        const sql = "delete from root";
        return await pool.query(sql);
    }


    async function setRoot(pool, key) {

        let data = await getRoot(db.pool)
        if (data.rowCount > 0) {
            console.warn("root is already set")
            return;
        }

        const sql = "insert into root (key) values ($1);";
        let result;
        var client = await pool.connect()
        try {
            await client.query("delete from root;");
            await client.query(sql, [key]);
        } finally {
            client.release()
        }
    }


    db.getRoot = async function (cb) {
        try {
            let data = await getRoot(db.pool);
            if (data.rowCount == 1) {
                cb(null, data.rows[0].key)
            } else {
                cb(null, "not set!")
            }
        } catch (e) {
            cb(e, null)
        }
    }

    db.setRoot = async function (cb, key) {
        try {
            await setRoot(db.pool, key);
            cb(null, {})
        } catch (e) {
            cb(e, null)
        }
    }

    db.clearRoot = async function (cb) {
        try {
            await clearRoot(db.pool);
            cb(null, {})
        } catch (e) {
            cb(e, null)
        }
    }

    return db;

}
