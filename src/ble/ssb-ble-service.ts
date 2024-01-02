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
import {SsbBle} from './ssb-ble';

import {SsidCharacteristic} from './ssid-characteristic';
import { WifiPasswordCharacteristic } from './wifi-password-characteristic';
import { RootCharacteristic } from './root-characteristic';
import { getServiceUuid } from './ServiceDefinition';
import { ClearRootCharacteristic } from './clear-root-characteristic';


export class SsbBleService extends bleno.PrimaryService {
  constructor(public ssbBle: SsbBle) {
    super({
      uuid: getServiceUuid('SsbRelay'),
      characteristics: [
        new SsidCharacteristic(ssbBle),
        new WifiPasswordCharacteristic(ssbBle),
        new RootCharacteristic(ssbBle),
        new ClearRootCharacteristic(ssbBle),
      ]
    });
  }
};