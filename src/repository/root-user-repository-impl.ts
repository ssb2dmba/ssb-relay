import type { RootUser } from "../entities/root-user";
import pool from "../repository/pool";
import type { RootUserRepository } from "./root-user-repository";

export class RootUserRepositoryImpl implements RootUserRepository {
  async setRootUser(rootUser: RootUser): Promise<void> {
    await pool.query("insert into root (key) values ($1)", [rootUser.key]);
  }

  async clearRootUser(): Promise<void> {
    await pool.query("delete from root");
  }

  async getRootUser(): Promise<RootUser> {
    const dbResponse = await pool.query("SELECT * FROM root");
    const result = dbResponse.rows.map((item) => ({
      key: item.key,
    }));
    return result[0];
  }
}
