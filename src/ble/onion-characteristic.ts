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


export class OnionCharacteristic extends bleno.Characteristic {

    constructor(public ssbBle: SsbBleService) {
      super({
        uuid: getCharacteristicUuid('SsbRelay', 'onion'),
        properties: ['read'],
        descriptors: [
          new bleno.Descriptor({
            uuid: '2901',
            value: 'onion'
          })
        ]
      });
    }
  

    onReadRequest(offset: number, callback: (result: number, data?: Buffer | undefined) => void): void {
      this.ssbBle.getOnion(callback);
    }
  };