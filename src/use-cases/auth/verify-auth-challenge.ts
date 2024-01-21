
import { IAuthenticationService } from "../../entities/auth-challenge-service"
import { RootUserRepository } from "../../repository/root-user-repository"

export interface IVerifyAuthChallenge {
    rootUserRepository: RootUserRepository;
    execute(authChallengeStruct: IAuthenticationService.AuthChallengeStruct, signature: String): Promise<IAuthenticationService.AuthResult | null>;
}

