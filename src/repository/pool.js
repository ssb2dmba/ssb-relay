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

import { Pool } from "pg"; // Client import is req.

const lockable = async (pool) => {
  const client = await pool.connect();
  console.log(
    `🐘 Postgres is online  at ${client.user}@${client.host}/${client.database}`,
  );
  client.release();
};

const pool = new Pool({
  user: "ssb",
  host: "localhost",
  database: "ssb",
  password: "ssb",
  port: 5432, // Default PostgreSQL port
});

// await for the pool to be up
lockable(pool).then(() => {
  // do nothing
});

export default pool;
