const SmartMapUtil = require('./SmartMapUtil');

describe('SmartMapUtil', () => {

  test('constructor', () => {
    const config = {
      configFilePath: 'configFilePath',
      inputDir: 'inputDir',
      outputDir: 'outputDir',
      mbtileName: 'mbtileName',
    };
    const smartMapUtil = new SmartMapUtil(config);
    expect(smartMapUtil.config).toEqual({});
    expect(smartMapUtil.inputDir).toBe('inputDir');
    expect(smartMapUtil.crs).toBe('EPSG:4326');
    expect(smartMapUtil.outputDir).toBe('outputDir');
    expect(smartMapUtil.mbtileName).toBe('mbtileName');
  });

  
});