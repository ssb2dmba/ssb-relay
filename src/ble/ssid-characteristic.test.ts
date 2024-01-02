import { SsidCharacteristic } from './ssid-characteristic';
import { SsbBle } from './ssb-ble';
import bleno from '@abandonware/bleno';
const secretStack = require('secret-stack')

jest.mock('@abandonware/bleno', () => ({
  Characteristic: jest.fn(),
  Descriptor: jest.fn(),
}));

describe('SsidCharacteristic', () => {
  let ssidCharacteristic: SsidCharacteristic;


  
  beforeEach(() => { 
    const stack = secretStack({})
    stack.getRoot = ()=> (
      "root"
    )
    let ssbBle: SsbBle = new SsbBle(stack);
    ssidCharacteristic = new SsidCharacteristic(ssbBle);
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