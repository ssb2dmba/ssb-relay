import { RootUser } from "../entities/root-user";
import { RootUserRepository } from "./root-user-repository";
import {Pool} from 'pg';

export class RootUserRepositoryImpl  implements RootUserRepository  {
    
    pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }


    async setRootUser(rootUser: RootUser): Promise<void>  {
        await this.pool.query('insert into root (key) values ($1)', [rootUser.key]);
    }

    async clearRootUser(): Promise<void> {
        await this.pool.query('delete from root');
    }

    async getRootUser(): Promise<RootUser> {
        const dbResponse = await this.pool.query('SELECT * FROM root');
        const result = dbResponse.rows.map(item => ({
            key: item.key
        }));
        return result[0];
    }
}