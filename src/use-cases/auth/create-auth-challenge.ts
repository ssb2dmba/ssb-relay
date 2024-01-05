
import { IAuthenticationService }  from "../../entities/auth-challenge-service"
import { RootUserRepository } from "../../repository/root-user-repository"

export interface ICreateAuthChallenge {
    rootUserRepository: RootUserRepository;
    execute(): Promise<IAuthenticationService.AuthChallengeStruct>;
}