import { ClearRootCharacteristic } from './clear-root-characteristic';
import { SsbBle } from './ssb-ble';
import bleno from '@abandonware/bleno';
const secretStack = require('secret-stack')

jest.mock('@abandonware/bleno', () => ({
  Characteristic: jest.fn(),
  Descriptor: jest.fn(),
}));

describe('SsidCharacteristic', () => {
  let clearRootCharacteristic: ClearRootCharacteristic;


  
  beforeEach(() => { 
    const stack = secretStack({})
    stack.getRoot = ()=> (
      "root"
    )
    let ssbBle: SsbBle = new SsbBle(stack);
    clearRootCharacteristic = new ClearRootCharacteristic(ssbBle);
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