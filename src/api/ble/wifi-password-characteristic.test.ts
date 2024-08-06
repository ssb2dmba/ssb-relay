import bleno from "@abandonware/bleno";
import { ClearRootUserImpl } from "../../use-cases/ble-conf/clear-root-impl";
import { GetIpAdressImpl } from "../../use-cases/ble-conf/get-ip-addr";
import { GetOnionAdressImpl } from "../../use-cases/ble-conf/get-onion-addr";
import { GetRootUserImpl } from "../../use-cases/ble-conf/get-root-impl";
import { SetRootUserImpl } from "../../use-cases/ble-conf/set-root-impl";

import { RootUserRepositoryImpl } from "../../repository/root-user-repository-impl";
import type { Scuttlebot } from "../../ssb/types/scuttlebot-type";
import { SsbBleService } from "./ssb-ble-service";
import { WifiPasswordCharacteristic } from "./wifi-password-characteristic";

describe("SsidCharacteristic", () => {
  let characteristic: WifiPasswordCharacteristic;

  beforeEach(() => {
    const stack = {} as any;
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
    characteristic = new WifiPasswordCharacteristic(ssbBleService);
  });

  test("constructor", () => {
    expect(characteristic).toBeInstanceOf(WifiPasswordCharacteristic);
  });

  test("onWriteRequest", () => {
    const callback = jest.fn();
    const data = Buffer.from("test");
    characteristic.onWriteRequest(data, 0, false, callback);
    expect(callback).toHaveBeenCalledWith(bleno.Characteristic.RESULT_SUCCESS);
  });
});
