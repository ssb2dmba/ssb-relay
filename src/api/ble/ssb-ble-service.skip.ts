import bleno from "@abandonware/bleno";
import { ClearRootUserImpl } from "../../use-cases/ble-conf/clear-root-impl";
import { GetIpAdressImpl } from "../../use-cases/ble-conf/get-ip-addr";
import { GetOnionAdressImpl } from "../../use-cases/ble-conf/get-onion-addr";
import { GetRootUserImpl } from "../../use-cases/ble-conf/get-root-impl";
import { SetRootUserImpl } from "../../use-cases/ble-conf/set-root-impl";
import { RootUserRepositoryImpl } from "../repository/root-user-repository-impl";
import { Scuttlebot } from "../types/scuttlebot-type";
import { SsbBleService } from "./ssb-ble-service";
jest.mock("@abandonware/bleno");

describe("SsbBleService", () => {
  let ssbBle: SsbBleService;
  let stack: any;

  beforeEach(() => {
    if (process.env["GITHUB_ACTION"]) return;
    let stack = {} as any;
    stack.getDbConnectionPool = function () {
      return {
        query: jest.fn().mockResolvedValue({
          rows: [{ key: "testKey" }],
        }),
      };
    };
    stack.getRoot = jest.fn().mockReturnValue("root");
    ssbBle = new SsbBleService(
      new GetRootUserImpl(
        new RootUserRepositoryImpl((stack as Scuttlebot).getDbConnectionPool()),
      ),
      new SetRootUserImpl(
        new RootUserRepositoryImpl((stack as Scuttlebot).getDbConnectionPool()),
      ),
      new ClearRootUserImpl(
        new RootUserRepositoryImpl((stack as Scuttlebot).getDbConnectionPool()),
      ),
      new GetIpAdressImpl(),
      new GetOnionAdressImpl(),
    );
  });

  test("genPincode", () => {
    if (process.env["GITHUB_ACTIONS"]) return;
    ssbBle.genPincode();
    expect(ssbBle.pincode).toBeGreaterThanOrEqual(0);
    expect(ssbBle.pincode).toBeLessThanOrEqual(999999);
  });

  test("clearRoot with valid pincode", () => {
    if (process.env["GITHUB_ACTIONS"]) return;
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    ssbBle.pincode = 123456;
    ssbBle.clearRoot(123456);
    expect(warn).toHaveBeenCalledWith("🔥 root owner cleared");
  });

  test("clearRoot with invalid pincode", () => {
    if (process.env["GITHUB_ACTIONS"]) return;
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    ssbBle.pincode = 123456;
    ssbBle.clearRoot(654321);
    expect(warn).toHaveBeenCalledWith("⚠️ ⚠️ ⚠️  Using invalid pincode !");
  });
});
