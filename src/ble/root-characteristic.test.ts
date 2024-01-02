import { RootCharacteristic } from './root-characteristic';
import { SsbBle } from './ssb-ble';
import bleno from '@abandonware/bleno';
const secretStack = require('secret-stack')

jest.mock('@abandonware/bleno', () => ({
  Characteristic: jest.fn(),
  Descriptor: jest.fn(),
}));

describe('SsidCharacteristic', () => {
  let rootCharacteristic: RootCharacteristic;


  
  beforeEach(() => { 
    const stack = secretStack({})
    stack.getRoot = ()=> (
      "root"
    )
    stack.setRoot=jest.fn();
    let ssbBle: SsbBle = new SsbBle(stack);
    rootCharacteristic = new RootCharacteristic(ssbBle);
  });

  test('constructor', () => {
    expect(rootCharacteristic).toBeInstanceOf(RootCharacteristic);
  });

  
  test('onWriteRequest', () => {
    const callback = jest.fn();
    const data = Buffer.from('test');
    rootCharacteristic.onWriteRequest(data, 0, false, callback);
    expect(callback).toHaveBeenCalledWith(bleno.Characteristic.RESULT_SUCCESS);
  });
});