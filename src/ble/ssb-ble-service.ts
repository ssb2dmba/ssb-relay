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

export class SsbBleService  {

  ssid: String = "";
  password: String ="";
  pincode: Number = -1;
  getRootUserUseCase: GetRootUserImpl;
  setRootUserUseCase: SetRootUserImpl;
  clearRootUserUseCase: ClearRootUserImpl;

  constructor(
    getRootUserUseCase: GetRootUserImpl, 
    setRootUserUseCase: SetRootUserImpl,
    clearRootUserUseCase: ClearRootUserImpl,
   ) {
    this.getRootUserUseCase= getRootUserUseCase;
    this.setRootUserUseCase= setRootUserUseCase;
    this.clearRootUserUseCase= clearRootUserUseCase;
    this.genPincode()
  }


  setSsid(ssid: String) {
    this.ssid = ssid
    console.log(`⚠️ set ssid: ${ssid}`)
  }

  setWifiPassword(password: String, callback: any) {
    this.password = password
    console.log(`⚠️ set wifi password: ${password}`)
    if (this.ssid != "" && this.password!="") {
        const cmd =`sudo setWIFI.sh "${this.ssid}" "${this.password}"`;
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

  async setRoot(root: string):Promise<void> {
    this.setRootUserUseCase.execute(root);
  }

  async getRoot(): Promise<string> {
    const rootUser = await  this.getRootUserUseCase.execute();
    if (rootUser == null) return ""
    return rootUser.key
  }

  clearRoot(pcode: Number) {
    if (this.pincode==pcode) {
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
    }  else  {
      console.log(`🔥 please claim ownership via bluetooth`)
    }
    console.log(`🔥 security pincode: ${this.pincode}`)
  }
  

};
