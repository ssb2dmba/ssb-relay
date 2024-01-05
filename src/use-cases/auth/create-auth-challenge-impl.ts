
import { IAuthenticationService }  from "../../entities/auth-challenge-service"
import { RootUser } from "../../entities/root-user"
import { RootUserRepository } from "../../repository/root-user-repository"
import { ICreateAuthChallenge } from "./create-auth-challenge"

export class CreateAuthChallengeImpl  implements ICreateAuthChallenge {
    
    rootUserRepository: RootUserRepository

    constructor(rootUserRepository: RootUserRepository) {
        this.rootUserRepository = rootUserRepository
    }

    async execute(): Promise<IAuthenticationService.AuthChallengeStruct> {
        const rootUser: RootUser =  await this.rootUserRepository.getRootUser()
        if (rootUser == null) throw new Error("Root user not set, please claim device via Bluetooth");
        const authChallengeStruct = new IAuthenticationService.AuthChallengeStruct (rootUser.key)
        return authChallengeStruct;
    }
}