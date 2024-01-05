import { RootUserRepository } from "../../repository/root-user-repository"


export class ClearRootUserImpl   {
    
    rootUserRepository: RootUserRepository

    constructor(rootUserRepository: RootUserRepository) {
        this.rootUserRepository = rootUserRepository
    }

    execute(): void {
        this.rootUserRepository.clearRootUser()
    }
}