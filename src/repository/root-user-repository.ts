import { RootUser } from "../../entities/root-user";

export interface RootUserRepository {
  getRootUser(): Promise<RootUser>;
  setRootUser(rootUser: RootUser): void;
  clearRootUser(): void;
}
