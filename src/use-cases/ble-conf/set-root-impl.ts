import { RootUser } from "../../entities/root-user"
import { RootUserRepository } from "../../repository/root-user-repository"


export class SetRootUserImpl   {
    
    rootUserRepository: RootUserRepository

    constructor(rootUserRepository: RootUserRepository) {
        this.rootUserRepository = rootUserRepository
    }

    execute(key: string): void {
        const rootUser: RootUser =  new RootUser(key);
        this.rootUserRepository.clearRootUser()
        this.rootUserRepository.setRootUser(rootUser)
    }
}