import type { RootUser } from "../entities/root-user";
import getPool from "../repository/pool";
import type { RootUserRepository } from "./root-user-repository";

export class RootUserRepositoryImpl implements RootUserRepository {
  async setRootUser(rootUser: RootUser): Promise<void> {
    await getPool().query("insert into root (key) values ($1)", [rootUser.key]);
  }

  async clearRootUser(): Promise<void> {
    await getPool().query("delete from root");
  }

  async getRootUser(): Promise<RootUser> {
    const dbResponse = await getPool().query("SELECT * FROM root");
    const result = dbResponse.rows.map((item) => ({
      key: item.key,
    }));
    return result[0];
  }
}
