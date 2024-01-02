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
import { Scuttlebot } from '../types/scuttlebot-type';

export class SsbBle  {

  ssid: String = "";
  password: String ="";
  pincode: Number = -1;

  constructor(public sbot: Scuttlebot) {
    this.sbot = sbot
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

  setRoot(root: String) {
    this.sbot.setRoot((err:any) => { console.log(err) }, root)
  }

  getRoot(cb: Function) {
    return this.sbot.getRoot(cb)
  }

  clearRoot(pcode: Number) {
    if (this.pincode==pcode) {
      return this.sbot.clearRoot((err: any, ok: any)=>{
        if (err) {
          console.log(err)
          return
        } 
        console.warn("🔥 root owner cleared")
      })
    } else {
      console.warn("⚠️ ⚠️ ⚠️  Using invalid pincode !")
    }

  }

  genPincode() {  
    this.pincode = Math.floor(Math.random() * (999999 + 1))
    this.getRoot((err: any,ok: any) => {
      if (ok) { 
        console.log(`👨 owner: ${ok} ***`)
      } else {
        console.error(err)
      }
    })
    console.log(`🔥 security pincode: ${this.pincode}`)
  }
  

};
