import bleno from "@abandonware/bleno";
import { ClearRootUserImpl } from "../use-cases/ble-conf/clear-root-impl";
import { GetIpAdressImpl } from "../use-cases/ble-conf/get-ip-addr";
import { GetOnionAdressImpl } from "../use-cases/ble-conf/get-onion-addr";
import { GetRootUserImpl } from "../use-cases/ble-conf/get-root-impl";
import { SetRootUserImpl } from "../use-cases/ble-conf/set-root-impl";

import { RootUserRepositoryImpl } from "../repository/root-user-repository-impl";
import { RootCharacteristic } from "./root-characteristic";
import { SsbBleService } from "./ssb-ble-service";
import { describe, it, beforeEach, test, after } from "node:test";
import {expect} from "chai";

describe("SsidCharacteristic", () => {
  let rootCharacteristic: RootCharacteristic;

  beforeEach(() => {
    let stack = {} as any;

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
    rootCharacteristic = new RootCharacteristic(ssbBleService);
  });

  test("constructor", () => {
    expect(rootCharacteristic).toBeInstanceOf(RootCharacteristic);
  });

  test("onWriteRequest", () => {
    const callback = (result: number) => {};
    const data = Buffer.from("test");
    rootCharacteristic.onWriteRequest(data, 0, false, callback);
    expect(callback).toHaveBeenCalledWith(bleno.Characteristic.RESULT_SUCCESS);
  });

  after(() => {
    process.exit(0);
  });
});
