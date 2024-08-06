import { RootUser } from "../../entities/root-user";
import { RootUserRepository } from "../../repository/root-user-repository";

export class GetRootUserImpl {
  rootUserRepository: RootUserRepository;

  constructor(rootUserRepository: RootUserRepository) {
    this.rootUserRepository = rootUserRepository;
  }

  async execute(): Promise<RootUser> {
    const rootUser: RootUser = await this.rootUserRepository.getRootUser();
    return rootUser;
  }
}
