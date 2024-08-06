import bleno from "@abandonware/bleno";
import { ClearRootUserImpl } from "../../use-cases/ble-conf/clear-root-impl";
import { GetIpAdressImpl } from "../../use-cases/ble-conf/get-ip-addr";
import { GetOnionAdressImpl } from "../../use-cases/ble-conf/get-onion-addr";
import { GetRootUserImpl } from "../../use-cases/ble-conf/get-root-impl";
import { SetRootUserImpl } from "../../use-cases/ble-conf/set-root-impl";

import { RootUserRepositoryImpl } from "../../repository/root-user-repository-impl";
import type { Scuttlebot } from "../../ssb/types/scuttlebot-type";
import { RootCharacteristic } from "./root-characteristic";
import { SsbBleService } from "./ssb-ble-service";

jest.mock("@abandonware/bleno", () => ({
  Characteristic: jest.fn(),
  Descriptor: jest.fn(),
}));

describe("SsidCharacteristic", () => {
  let rootCharacteristic: RootCharacteristic;

  beforeEach(() => {
    let stack = {} as any;
    stack.getDbConnectionPool = () => ({
      query: jest.fn().mockResolvedValue({
        rows: [{ key: "testKey" }],
      }),
    });
    const ssbBleService: SsbBleService = new SsbBleService(
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
    rootCharacteristic = new RootCharacteristic(ssbBleService);
  });

  test("constructor", () => {
    expect(rootCharacteristic).toBeInstanceOf(RootCharacteristic);
  });

  test("onWriteRequest", () => {
    const callback = jest.fn();
    const data = Buffer.from("test");
    rootCharacteristic.onWriteRequest(data, 0, false, callback);
    expect(callback).toHaveBeenCalledWith(bleno.Characteristic.RESULT_SUCCESS);
  });
});
