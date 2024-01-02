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
import os from 'os';
const name = `SsbRelay-${os.hostname()}`;
process.env.BLENO_DEVICE_NAME = name;

//
// Pizza
// * setSsid
// * ...
//
import { SsbBle } from './ssb-ble';

//
// The BLE Service!
//
import { SsbBleService } from './ssb-ble-service';

//
// A name to advertise our Service.
//


//
// Require bleno peripheral library.
// https://github.com/sandeepmistry/bleno
//
import bleno from '@abandonware/bleno';
import { Scuttlebot } from '../types/scuttlebot-type';

export class SsbPeripheral {

  constructor(sbot: Scuttlebot) {

    const ssbBleService = new SsbBleService(new SsbBle(sbot));
    

    //
    // Wait until the BLE radio powers on before attempting to advertise.
    // If you don't have a BLE radio, then it will never power on!
    //
    bleno.on('stateChange', function (state) {
      if (state === 'poweredOn') {
        //
        // We will also advertise the service ID in the advertising packet,
        // so it's easier to find.
        //
        bleno.startAdvertising(name, [ssbBleService.uuid], function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log(`👍 Begin advertising '${name}'`);
          }
        });
      }
      else {
        console.log("Stop advertising");
        bleno.stopAdvertising();
      }
    });

    bleno.on('advertisingStart', function (err) {
      if (!err) {
        //
        // Once we are advertising, it's time to set up our services,
        // along with our characteristics.
        //
        bleno.setServices([
          ssbBleService
        ]);
      } else {
        console.warn("Error advertising: ", err);
      }
    });

    // bleno.on("accept", address => console.log("Accept", address));
    // bleno.on("addressChange", address => console.log("addressChange", address));
    // bleno.on("advertisingStart", err => console.log("Advertising... ", err));
    // bleno.on("advertisingStartError", err => console.log("Advertising start error", err));
    // bleno.on("advertisingStop", () => console.log("Advertising Stop"));
    // bleno.on("disconnect", address => console.log(`Disconnect from ${address}`));
    // bleno.on("mtuChange", mtu => console.log("New MTU", mtu));
    // bleno.on('platform', platform => console.log(`Platform: ${platform}`));
    // bleno.on("rssiUpdate", rssi => console.log(`RSSI: ${rssi}`));
    // bleno.on("servicesSet", err => console.log(`Services set ${err}`, err));
    // bleno.on("servicesSetError", err => console.log(`Services set err:`, err));
    // bleno.on("stateChange", newState => console.log("State Change", newState));

  }
}