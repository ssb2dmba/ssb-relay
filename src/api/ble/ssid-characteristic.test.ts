//import bleno from "@abandonware/bleno";
import { ClearRootUserImpl } from "../../use-cases/ble-conf/clear-root-impl";
import { GetIpAdressImpl } from "../../use-cases/ble-conf/get-ip-addr";
import { GetOnionAdressImpl } from "../../use-cases/ble-conf/get-onion-addr";
import { GetRootUserImpl } from "../../use-cases/ble-conf/get-root-impl";
import { SetRootUserImpl } from "../../use-cases/ble-conf/set-root-impl";

import { RootUserRepositoryImpl } from "../../repository/root-user-repository-impl";
import { SsbBleService } from "./ssb-ble-service";
import { SsidCharacteristic } from "./ssid-characteristic";

jest.mock("@abandonware/bleno", () => ({
  Characteristic: jest.fn(),
  Descriptor: jest.fn(),
}));

describe("SsidCharacteristic", () => {
  let ssidCharacteristic: SsidCharacteristic;

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
    ssidCharacteristic = new SsidCharacteristic(ssbBleService);
  });

  test("constructor", () => {
    expect(ssidCharacteristic).toBeInstanceOf(SsidCharacteristic);
  });

  test("onWriteRequest", () => {
    const callback = jest.fn();
    const data = Buffer.from("test");
    ssidCharacteristic.onWriteRequest(data, 0, false, callback);
    //expect(callback).toHaveBeenCalledWith(bleno.Characteristic.RESULT_SUCCESS);
  });
});
