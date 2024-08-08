import { describe, beforeEach, test, after } from "node:test";
import {expect} from "chai";
import { RootUserRepositoryImpl } from "./root-user-repository-impl";



describe("RootUserRepository", () => {
  let rootUserRepositoryImpl: RootUserRepositoryImpl;
  //let pool: Pool;

  beforeEach(() => {
    //pool = new Pool();
    rootUserRepositoryImpl = new RootUserRepositoryImpl();
  });



  test("should return data", async () => {
    const result = await rootUserRepositoryImpl.getRootUser();
    expect(result.key).toEqual("testKey");
  });

  after(()=> {
    process.exit(0)
  })

});
