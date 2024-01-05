import { ClearRootCharacteristic } from './clear-root-characteristic';
import { SsbBleService } from './ssb-ble-service';
import bleno from '@abandonware/bleno';
import { GetRootUserImpl } from '../use-cases/ble-conf/get-root-impl';
import { RootUserRepositoryImpl } from '../repository/root-user-repository-impl';
import { SetRootUserImpl } from '../use-cases/ble-conf/set-root-impl';
import { ClearRootUserImpl } from '../use-cases/ble-conf/clear-root-impl';
import { Scuttlebot } from '../types/scuttlebot-type';

jest.mock('@abandonware/bleno', () => ({
  Characteristic: jest.fn(),
  Descriptor: jest.fn(),
}));

describe('SsidCharacteristic', () => {
  let clearRootCharacteristic: ClearRootCharacteristic;


  
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
      new ClearRootUserImpl(new RootUserRepositoryImpl((stack as Scuttlebot).getDbConnectionPool()))
    )
    clearRootCharacteristic = new ClearRootCharacteristic(ssbBleService);
  });

  test('constructor', () => {

    expect(clearRootCharacteristic).toBeInstanceOf(ClearRootCharacteristic);
  });

  
  test('onWriteRequest', () => {
    const callback = jest.fn();
    const data = Buffer.from('test');
    clearRootCharacteristic.onWriteRequest(data, 0, false, callback);
    expect(callback).toHaveBeenCalledWith(bleno.Characteristic.RESULT_SUCCESS);
  });
});