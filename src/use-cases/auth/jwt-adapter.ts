import jwt from "jsonwebtoken";
import * as crypto from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os'

export const secret = "my_secret";

export class JwtAdapter  {


    static async encrypt(text: string | number | Buffer): Promise<any> {

        const md5fn = (contents: string) => crypto.createHash('md5').update(contents).digest("hex");
        const secret = md5fn( readFileSync(join(homedir(),".ssb", "secret"), 'utf-8'));
        return jwt.sign({account: text}, secret, {expiresIn: "1d"});
    }
}