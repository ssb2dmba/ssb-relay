import { SsbBle } from './ssb-ble';
const secretStack = require('secret-stack')




describe('SsbBle', () => {
  let ssbBle: SsbBle;
  let stack: any;

  beforeEach(() => {
    stack = secretStack({});
    stack.getRoot = jest.fn().mockReturnValue("root");
    ssbBle = new SsbBle(stack);
  });


  // test('genPincode', () => {
  //   const stack = secretStack({})
  //   stack.getRoot = ()=> (
  //     "root"
  //   )
  //   stack.setRoot=jest.fn();
  //   let ssbBle = new SsbBle(stack);
  //   ssbBle.genPincode();
  //   expect(ssbBle.pincode).toBeGreaterThanOrEqual(0);
  //   expect(ssbBle.pincode).toBeLessThanOrEqual(999999);
  // });

  test('genPincode', () => {
    ssbBle.genPincode();
    expect(ssbBle.pincode).toBeGreaterThanOrEqual(0);
    expect(ssbBle.pincode).toBeLessThanOrEqual(999999);
  });

  test('clearRoot with valid pincode', () => {
    const mockClearRoot = jest.fn((callback: any) => {
      callback(null, "ok");
    });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    ssbBle.sbot.clearRoot = mockClearRoot;
    ssbBle.pincode = 123456;
    ssbBle.clearRoot(123456);
    expect(mockClearRoot).toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith("🔥 root owner cleared");
  });

  test('clearRoot with invalid pincode', () => {
    const mockClearRoot = jest.fn((callback: any) => {
      callback(null, "ok");
    });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    ssbBle.sbot.clearRoot = mockClearRoot;
    ssbBle.pincode = 123456;
    ssbBle.clearRoot(654321);
    expect(mockClearRoot).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith("⚠️ ⚠️ ⚠️  Using invalid pincode !");
  });
});