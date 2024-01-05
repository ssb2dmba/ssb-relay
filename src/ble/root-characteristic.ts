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
import bleno from '@abandonware/bleno';
import { getCharacteristicUuid } from './ServiceDefinition';
import { SsbBleService } from './ssb-ble-service';


export class RootCharacteristic extends bleno.Characteristic {
    constructor(public ssbBleService: SsbBleService) {
      super({
        uuid: getCharacteristicUuid('SsbRelay', 'root'),
        properties: ['read', 'write'],
        descriptors: [
          new bleno.Descriptor({
            uuid: '2901',
            value: 'root'
          })
        ]
      });
    }
  
    async onWriteRequest(data: Buffer, offset: number, withoutResponse: boolean, callback: (result: number) => void) {
        const root = data.toString(); 
        this.ssbBleService.setRoot(root);
        callback(this.RESULT_SUCCESS);
    }

    onReadRequest(offset: number, callback: (result: number, data?: Buffer | undefined) => void): void {
      this.ssbBleService.getRoot().then((root) => {  
        callback(this.RESULT_SUCCESS, Buffer.from(root));
      }).catch((error) => {
        console.error(error)
        callback(this.RESULT_UNLIKELY_ERROR);
      });
  };
}