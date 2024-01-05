import { RootUserRepository } from "../../repository/root-user-repository";
import * as crypto from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os'

import { CreateAuthChallengeImpl } from "./create-auth-challenge-impl";
import { VerifyAuthChallengeImpl } from "./verify-auth-challenge-impl";
import { RootUser } from "../../entities/root-user";
import { IAuthenticationService } from "../../entities/auth-challenge-service";
import jwt from "jsonwebtoken";
const ssbKeys = require('ssb-keys');

jest.mock('../../repository/root-user-repository');

describe('CreateAuthChallengeImpl', () => {


    class MockRootUserRepository implements RootUserRepository {
        setRootUser(rootUser: RootUser): void {
            throw new Error("Method not implemented.");
        }
        clearRootUser(): void {
            throw new Error("Method not implemented.");
        }
        getRootUser(): Promise<RootUser> {
            throw new Error("Method not implemented.");
        }
    }

    let rootMockRootUserRepository: RootUserRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        rootMockRootUserRepository = new MockRootUserRepository()
    });

    test('execute', async () => {
        var keys = ssbKeys.generate()
        const mockRootUser = new RootUser('@' + keys.public);
        jest.spyOn(rootMockRootUserRepository, "getRootUser").mockImplementation(() => Promise.resolve(mockRootUser))
        const createAuthChallengeImpl = new CreateAuthChallengeImpl(rootMockRootUserRepository);
        const authChallengeStruct = await createAuthChallengeImpl.execute();

        expect(authChallengeStruct.key).toEqual(mockRootUser.key);
        expect(authChallengeStruct.value.nonce).toHaveLength(64);
        expect(Date.now() - authChallengeStruct.value.timestamp).toBeLessThanOrEqual(5000);
        const verifyAuthChallengeImpl = new VerifyAuthChallengeImpl(rootMockRootUserRepository);

        const signed= ssbKeys.signObj(keys, authChallengeStruct)
        let result = ssbKeys.verifyObj(keys, signed);
        expect(result).toEqual(true);
        let verificationResult:IAuthenticationService.AuthResult|null = await verifyAuthChallengeImpl.execute(authChallengeStruct, signed);
        expect(verificationResult).not.toBe(null) 
        const md5fn = (contents: string) => crypto.createHash('md5').update(contents).digest("hex");
        const secret = md5fn( readFileSync(join(homedir(),".ssb", "secret"), 'utf-8'));
        let b:string | jwt.JwtPayload = await  jwt.verify(verificationResult!.accessToken, secret);
        expect((b as jwt.JwtPayload).account).toEqual(mockRootUser.key);
        result = await verifyAuthChallengeImpl.execute(authChallengeStruct, signed);
        authChallengeStruct.value.timestamp = 0;
        // ex:
        // sk: uTOmxoo3uXkfdtWnKj2VIo7zWbU2cRrvWFv7EswpwFcJlHxiyWVcc4U/+H/YN0Szm3v7x4EXUb/g3FXtCz3AQ==.ed25519
        // {
        //     value: {
        //       nonce: '9791814847bc289a94dc0feb2f121f4d802ebfa2cc120b786dc8543755421272',
        //       timestamp: 1704301553750
        //     },
        //     key: '@XCZR8YsllXHOFP/h/2DdEs5t7+8eBF1G/4NxV7Qs9wE=.ed25519',
        //     signature: 'SdadTJCoNVgXmAE0Arh07cwzk+2dePhgqhAj+ZVlDQAk3XhC3YxlQR1T3VyQHgEzA5XAPt05IN3wHkEGJnT/CA==.sig.ed25519'
        //   }
        result = await verifyAuthChallengeImpl.execute(authChallengeStruct, signed);
        expect(result).toEqual(null);
    });
});

