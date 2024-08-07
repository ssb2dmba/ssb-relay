import { exec } from "node:child_process";
import bleno from "@abandonware/bleno";
import { getCharacteristicUuid } from "./ServiceDefinition";
import type { SsbBleService } from "./ssb-ble-service";

export class WifiPasswordCharacteristic extends bleno.Characteristic {
  constructor(public ssbBle: SsbBleService) {
    super({
      uuid: getCharacteristicUuid("SsbRelay", "ssid"),
      properties: ["read", "write"],
      descriptors: [
        new bleno.Descriptor({
          uuid: "2901",
          value: "wifi password",
        }),
      ],
    });
  }

  onWriteRequest(
    data: Buffer,
    offset: number,
    withoutResponse: boolean,
    callback: (result: number) => void,
  ) {
    const ssidString = data.toString();
    console.log(`Preparing to write new ssid: ${ssidString}`);
    this.ssbBle.setSsid(ssidString);
    callback(this.RESULT_SUCCESS);
  }

  onReadRequest(
    offset: number,
    callback: (result: number, data?: Buffer | undefined) => void,
  ): void {
    const cmd = "/sbin/iw wlan0 info";
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        callback(this.RESULT_UNLIKELY_ERROR);
      } else {
        var buf = Buffer.from(stdout, "utf8");
        callback(this.RESULT_SUCCESS, buf);
      }
    });
  }
}
