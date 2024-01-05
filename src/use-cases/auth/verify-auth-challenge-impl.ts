import { IAuthenticationService }  from "../../entities/auth-challenge-service"
import { RootUser } from "../../entities/root-user"
import { RootUserRepository } from "../../repository/root-user-repository"
import { IVerifyAuthChallenge } from "./verify-auth-challenge"
import { JwtAdapter } from './jwt-adapter';

const ssbKeys = require('ssb-keys');

export class VerifyAuthChallengeImpl implements IVerifyAuthChallenge {

    rootUserRepository: RootUserRepository
    
    constructor(rootUserRepository: RootUserRepository) {
        this.rootUserRepository = rootUserRepository
    }

    async execute(authChallengeStruct: IAuthenticationService.AuthChallengeStruct, signed: Object): Promise<IAuthenticationService.AuthResult|null> {
        const rootUser: RootUser =  await this.rootUserRepository.getRootUser()
        if (authChallengeStruct.key != rootUser.key) {
            console.warn("VerifyAuthChallengeImpl: Key mismatch")
            return null;
        }
        const result = ssbKeys.verifyObj({public: rootUser.key}, signed);
        if (!result) {
            console.warn(`VerifyAuthChallengeImpl.verify_auth: ${result}`)
            return null;
        }
        const accessToken = await JwtAdapter.encrypt(authChallengeStruct.key);
        return {
            accessToken
        }
    }
}

