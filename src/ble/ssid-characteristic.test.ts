import { SsidCharacteristic } from './ssid-characteristic';
import { SsbBleService } from './ssb-ble-service';
import bleno from '@abandonware/bleno';
import { GetRootUserImpl } from '../use-cases/ble-conf/get-root-impl';
import { RootUserRepositoryImpl } from '../repository/root-user-repository-impl';
import { SetRootUserImpl } from '../use-cases/ble-conf/set-root-impl';
import { ClearRootUserImpl } from '../use-cases/ble-conf/clear-root-impl';
import { Scuttlebot } from '../types/scuttlebot-type';
import { GetIpAdressImpl } from '../use-cases/ble-conf/get-ip-addr';
import { GetOnionAdressImpl } from '../use-cases/ble-conf/get-onion-addr';


jest.mock('@abandonware/bleno', () => ({
  Characteristic: jest.fn(),
  Descriptor: jest.fn(),
}));

describe('SsidCharacteristic', () => {
  let ssidCharacteristic: SsidCharacteristic;


  
  beforeEach(() => { 
    let stack = {} as any;
    stack.getDbConnectionPool = function () {
      return {
        query: jest.fn().mockResolvedValue({
          rows: [
            { key: 'testKey' },
          ]
        })
      }
    };


    let ssbBleService: SsbBleService = new SsbBleService(
      new GetRootUserImpl(new RootUserRepositoryImpl((stack as Scuttlebot).getDbConnectionPool())),
      new SetRootUserImpl(new RootUserRepositoryImpl((stack as Scuttlebot).getDbConnectionPool())),
      new ClearRootUserImpl(new RootUserRepositoryImpl((stack as Scuttlebot).getDbConnectionPool())),
      new GetIpAdressImpl(),
      new GetOnionAdressImpl()
    )
    ssidCharacteristic = new SsidCharacteristic(ssbBleService);
  });

  test('constructor', () => {

    expect(ssidCharacteristic).toBeInstanceOf(SsidCharacteristic);
  });

  
  test('onWriteRequest', () => {
    const callback = jest.fn();
    const data = Buffer.from('test');
    ssidCharacteristic.onWriteRequest(data, 0, false, callback);
    expect(callback).toHaveBeenCalledWith(bleno.Characteristic.RESULT_SUCCESS);
  });
});