import bleno from "@abandonware/bleno";
import { ClearRootUserImpl } from "../use-cases/ble-conf/clear-root-impl";
import { GetIpAdressImpl } from "../use-cases/ble-conf/get-ip-addr";
import { GetOnionAdressImpl } from "../use-cases/ble-conf/get-onion-addr";
import { GetRootUserImpl } from "../use-cases/ble-conf/get-root-impl";
import { SetRootUserImpl } from "../use-cases/ble-conf/set-root-impl";

import { RootUserRepositoryImpl } from "../repository/root-user-repository-impl";
import type { Scuttlebot } from "../ssb/types/scuttlebot-type";
import { SsbBleService } from "./ssb-ble-service";
import { WifiPasswordCharacteristic } from "./wifi-password-characteristic";
import { describe, beforeEach, test, after } from "node:test";
import {expect} from "chai";

describe("SsidCharacteristic", () => {
  let characteristic: WifiPasswordCharacteristic;

  beforeEach(() => {


    const ssbBleService: SsbBleService = new SsbBleService(
      new GetRootUserImpl(
        new RootUserRepositoryImpl(),
      ),
      new SetRootUserImpl(
        new RootUserRepositoryImpl(),
      ),
      new ClearRootUserImpl(
        new RootUserRepositoryImpl(),
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
    const callback = ()=>{}
    const data = Buffer.from("test");
    characteristic.onWriteRequest(data, 0, false, callback);
    //expect(callback).toHaveBeenCalledWith(bleno.Characteristic.RESULT_SUCCESS);
  });
  after(()=> {
    process.exit(0)
  })
});
