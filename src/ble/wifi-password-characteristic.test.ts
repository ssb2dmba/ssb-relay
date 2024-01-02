import { WifiPasswordCharacteristic } from './wifi-password-characteristic';
import { SsbBle } from './ssb-ble';
import bleno from '@abandonware/bleno';
const secretStack = require('secret-stack')

jest.mock('@abandonware/bleno', () => ({
  Characteristic: jest.fn(),
  Descriptor: jest.fn(),
}));

describe('SsidCharacteristic', () => {
  let characteristic: WifiPasswordCharacteristic ;


  
  beforeEach(() => { 
    const stack = secretStack({})
    stack.getRoot = ()=> (
      "root"
    )
    stack.setRoot=jest.fn();
    let ssbBle: SsbBle = new SsbBle(stack);
    characteristic = new WifiPasswordCharacteristic (ssbBle);
  });

  test('constructor', () => {
    expect(characteristic).toBeInstanceOf(WifiPasswordCharacteristic);
  });

  
  test('onWriteRequest', () => {
    const callback = jest.fn();
    const data = Buffer.from('test');
    characteristic.onWriteRequest(data, 0, false, callback);
    expect(callback).toHaveBeenCalledWith(bleno.Characteristic.RESULT_SUCCESS);
  });
  
});