/*
 * This file is part of the ssb-relay distribution (https://github.com/ssb2dmba/ssb-relay).
 * Copyright (c) 2023 DMBA Emmanuel Florent.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// Must be set before bleno is included the first time
import os from "os";
const name = `SsbRelay-${os.hostname()}`;
process.env.BLENO_DEVICE_NAME = name;

//
// Pizza
// * setSsid
// * ...
//
import { SsbBleService } from "./ssb-ble-service";

//
// The BLE Service!
//
import { SsbBleController } from "./ssb-ble-controller";

//
// A name to advertise our Service.
//

//
// Require bleno peripheral library.
// https://github.com/sandeepmistry/bleno
//
import bleno from "@abandonware/bleno";
import { RootUserRepositoryImpl } from "../../repository/root-user-repository-impl";
import type { Scuttlebot } from "../../ssb/types/scuttlebot-type";
import { ClearRootUserImpl } from "../../use-cases/ble-conf/clear-root-impl";
import { GetIpAdressImpl } from "../../use-cases/ble-conf/get-ip-addr";
import { GetOnionAdressImpl } from "../../use-cases/ble-conf/get-onion-addr";
import { GetRootUserImpl } from "../../use-cases/ble-conf/get-root-impl";
import { SetRootUserImpl } from "../../use-cases/ble-conf/set-root-impl";

export class SsbBleApplication {
  constructor(sbot: Scuttlebot) {
    const ssbBleController = new SsbBleController(
      new SsbBleService(
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
      ),
    );

    //
    // Wait until the BLE radio powers on before attempting to advertise.
    // If you don't have a BLE radio, then it will never power on!
    //
    bleno.on("stateChange", function (state) {
      if (state === "poweredOn") {
        //
        // We will also advertise the service ID in the advertising packet,
        // so it's easier to find.
        //
        bleno.startAdvertising(name, [ssbBleController.uuid], function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log(` \x1b[34mᛒ\x1b[0m Bluetooth advertising '${name}'`);
          }
        });
      } else {
        console.log("Stop advertising");
        bleno.stopAdvertising();
      }
    });

    bleno.on("advertisingStart", function (err) {
      if (!err) {
        //
        // Once we are advertising, it's time to set up our services,
        // along with our characteristics.
        //
        bleno.setServices([ssbBleController]);
      } else {
        console.warn("Error advertising: ", err);
      }
    });
    bleno.on("servicesSetError", (err) =>
      console.log(`Services set err:`, err),
    );
    bleno.on("advertisingStartError", (err) =>
      console.log("Advertising start error", err),
    );
  }
}
