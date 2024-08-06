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


export class ClearRootCharacteristic extends bleno.Characteristic {
  constructor(public ssbBle: SsbBleService) {
    super({
      uuid: getCharacteristicUuid('SsbRelay', 'clearRoot'),
      properties: ['write'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'clear root owner'
        })
      ]
    });
  }

  onWriteRequest(data: Buffer, offset: number, withoutResponse: boolean, callback: (result: number) => void) {
    const pincode = data.toString();;
    this.ssbBle.clearRoot(Number(pincode));
    callback(this.RESULT_SUCCESS);
  }


}
