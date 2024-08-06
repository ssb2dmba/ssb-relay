import { Pool } from "pg";
import { RootUserRepositoryImpl } from "./root-user-repository-impl";

jest.mock("pg", () => {
  const mPool = {
    connect: () => ({ query: jest.fn() }),
    query: jest.fn().mockResolvedValue({
      rows: [{ key: "testKey" }],
    }),
    end: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe("RootUserRepository", () => {
  let rootUserRepositoryImpl: RootUserRepositoryImpl;
  let pool: Pool;

  beforeEach(() => {
    pool = new Pool();
    rootUserRepositoryImpl = new RootUserRepositoryImpl(pool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return data", async () => {
    const result = await rootUserRepositoryImpl.getRootUser();
    expect(result.key).toEqual("testKey");
  });
});
