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
export const def = {
    services: {
      SsbRelay: {
        uuid: '13333333-3333-3333-3333-333333333337',
        characteristics: {
          ssid: {
            uuid: '11333333-3333-3333-3333-333333330001',
          },
          wifiPassword: {
            uuid: '12333333-3333-3333-3333-333333330002',
          },
          root: {
            uuid: '13333333-3333-3333-3333-333333330003',
          },
          clearRoot: {
            uuid: '14333333-3333-3333-3333-333333330004',
          },
          eth0: {
            uuid: '15333333-3333-3333-3333-333333330005',
          }, 
          wlan0: {
            uuid: '16333333-3333-3333-3333-333333330006',
          },                    
          onion: {
            uuid: '17333333-3333-3333-3333-333333330007',
          },   
        }
      }
    }
  };
  
  type ServiceType = keyof (typeof def)['services'];
  type CharacteristicType<S extends ServiceType = ServiceType> = keyof ((typeof def)['services'][S]['characteristics']);
  
  type foo = CharacteristicType<'SsbRelay'>;
  
  export function getServiceUuid(service: keyof (typeof def)['services']) {
    return def.services[service].uuid?.replace(/-/g, '');
  }
  export function getCharacteristicUuid<S extends ServiceType>(service: S, characteristic: CharacteristicType) {
    return def.services[service].characteristics[characteristic].uuid?.replace(/-/g, '');
  }
  
  export default def;