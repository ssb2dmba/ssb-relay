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
import { exec } from "node:child_process";
import { GetRootUserImpl } from "../use-cases/ble-conf/get-root-impl";
import { SetRootUserImpl } from "../use-cases/ble-conf/set-root-impl";
import { ClearRootUserImpl } from "../use-cases/ble-conf/clear-root-impl";
import { GetIpAdressImpl } from "../use-cases/ble-conf/get-ip-addr";
import { GetOnionAdressImpl } from "../use-cases/ble-conf/get-onion-addr";
import bleno from '@abandonware/bleno';

export class SsbBleService {

  ssid: String = "";
  password: String = "";
  pincode: Number = -1;
  getRootUserUseCase: GetRootUserImpl;
  setRootUserUseCase: SetRootUserImpl;
  clearRootUserUseCase: ClearRootUserImpl;
  getIpUseCase: GetIpAdressImpl;
  getOnionAddressUseCase: GetOnionAdressImpl;


  constructor(
    getRootUserUseCase: GetRootUserImpl,
    setRootUserUseCase: SetRootUserImpl,
    clearRootUserUseCase: ClearRootUserImpl,
    getIpUseCase: GetIpAdressImpl,
    getOnionAddressUseCase: GetOnionAdressImpl
  ) {
    this.getRootUserUseCase = getRootUserUseCase;
    this.setRootUserUseCase = setRootUserUseCase;
    this.clearRootUserUseCase = clearRootUserUseCase;
    this.getOnionAddressUseCase = getOnionAddressUseCase;
    this.getIpUseCase = getIpUseCase;
    this.genPincode()
  }


  setSsid(ssid: String) {
    this.ssid = ssid
    console.log(`⚠️ set ssid: ${ssid}`)
  }

  setWifiPassword(password: String, callback: any) {
    this.password = password
    console.log(`⚠️ set wifi password: ${password}`)
    if (this.ssid != "" && this.password != "") {
      const cmd = `sudo /usr/local/bin/setWIFI.sh "${this.ssid}" "${this.password}"`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(error)
          callback(error);
        } else {
          console.log(stdout)
          callback(null);
        }
      });
    }

  }

  getEth0(callback: (result: number, data?: Buffer | undefined) => void) {
    try {
      const response = this.getIpUseCase.execute("eth0")
      callback(bleno.Characteristic.RESULT_SUCCESS, Buffer.from(response));
    } catch (e: any) {
      callback(bleno.Characteristic.RESULT_UNLIKELY_ERROR);
    }
  }

  getWlan0(callback: (result: number, data?: Buffer | undefined) => void) {
    try {
      const response = this.getIpUseCase.execute("wlan0")
      callback(bleno.Characteristic.RESULT_SUCCESS, Buffer.from(response));
    } catch (e: any) {
      callback(bleno.Characteristic.RESULT_UNLIKELY_ERROR);
    }
  }

  getOnion(callback: (result: number, data?: Buffer | undefined) => void) {
    try {
      const onion = this.getOnionAddressUseCase.execute();
      callback(bleno.Characteristic.RESULT_SUCCESS, Buffer.from(onion));
    } catch (e: any) {
      callback(bleno.Characteristic.RESULT_UNLIKELY_ERROR);
    }
  }

  async setRoot(root: string): Promise<void> {
    this.setRootUserUseCase.execute(root);
  }

  async getRoot(): Promise<string> {
    const rootUser = await this.getRootUserUseCase.execute();
    if (rootUser == null) return ""
    return rootUser.key
  }

  clearRoot(pcode: Number) {
    if (this.pincode == pcode) {
      this.clearRootUserUseCase.execute();
      console.warn("🔥 root owner cleared")
    } else {
      console.warn("⚠️ ⚠️ ⚠️  Using invalid pincode !")
    }
  }

  async genPincode() {
    this.pincode = Math.floor(Math.random() * (999999 + 1))
    let owner = await this.getRootUserUseCase.execute()
    if (owner) {
      console.log(`👨 owner: ${owner.key}`)
    } else {
      console.log(`🔥 please claim ownership via bluetooth`)
    }
    console.log(`🔥 security pincode: ${this.pincode}`)
  }


};


