const myModule = require('../test_example');
describe('Module should return', function () {
  it('some number', function () {
    expect(myModule()).toEqual(10);
  });
});