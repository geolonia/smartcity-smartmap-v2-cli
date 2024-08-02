const SmartMapUtil = require('./SmartMapUtil');
const parse = require('./parseExcel');
const downloadFile = require('./downloadFile');

jest.mock('./parseExcel');
jest.mock('./downloadFile');
const mockConfig = [
  {
    '大カテゴリー': '都市計画情報',
    '中カテゴリー': '用途地域',
    'レイヤー名': '第一種低層住居専用地域',
    'データ種別': 'shape',
    'データ参照先': '第一種低層住居専用地域(60_40)'
  },
  {
    '大カテゴリー': '都市計画情報',
    '中カテゴリー': '用途地域',
    'レイヤー名': '第一種低層住居専用地域',
    'データ種別': 'shape',
    'データ参照先': '第一種低層住居専用地域(80_50)'
  },
  {
    '大カテゴリー': '都市計画情報',
    '中カテゴリー': '用途地域',
    'レイヤー名': '第一種中高層住居専用地域 ',
    'データ種別': 'shape',
    'データ参照先': '第一種中高層住居専用地域'
  },
  {
    '大カテゴリー': '施設情報',
    '中カテゴリー': 'くらし',
    'レイヤー名': 'AED設置場所',
    'データ種別': 'geojson',
    'データ参照先': 'https://opendata.takamatsu-fact.com/aed_location/data.geojson'
  },
  {
    '大カテゴリー': '施設情報',
    '中カテゴリー': 'くらし',
    'レイヤー名': '公衆無線LANアクセスポイント',
    'データ種別': 'geojson',
    'データ参照先': '公衆無線LAN'
  }
]

/***
 * 入力データの仕様
 */
describe('/*--------入力データの仕様--------*/', () => {

    beforeEach(() => {
        parse.mockClear();
        downloadFile.mockClear();
    });

    /**
     * カテゴリの仕様
     */
    test('カテゴリの仕様', async () => {
        parse.mockReturnValue(mockConfig);
        const util = new SmartMapUtil().build();
    });

    /****************
     * カテゴリ
     ****************/

    // test('throws an error if configFilePath is not provided', () => {
    //     expect(() => new SmartMapUtil({})).toThrow('configFilePath is required');
    // });

    // test('parses the config file correctly', () => {
    //     parse.mockReturnValue(mockConfig);
    //     const util = new SmartMapUtil({ configFilePath: '/path/to/config.xlsx' });
    //     expect(util.config).toEqual(mockConfig);
    // });

    // test('handles category validation - no category case', async () => {
    //     const config = [{ 'レイヤー名': 'topLayer' }];
    //     parse.mockReturnValue(config);
    //     const util = new SmartMapUtil({ configFilePath: '/path/to/config.xlsx' });
    //     await util.build();
    //     // Here you can add specific assertions related to no category case
    //     expect(util.config[0]['レイヤー名']).toBe('topLayer');
    // });

    // test('handles category validation - major category only', async () => {
    //     const config = [{ 'レイヤー名': 'topLayer', '大カテゴリ': 'major' }];
    //     parse.mockReturnValue(config);
    //     const util = new SmartMapUtil({ configFilePath: '/path/to/config.xlsx' });
    //     await util.build();
    //     // Here you can add specific assertions related to major category only
    //     expect(util.config[0]['大カテゴリ']).toBe('major');
    // });

    // test('throws an error if only subcategory is provided without a major category', () => {
    //     const config = [{ 'レイヤー名': 'subLayer', '中カテゴリ': 'sub' }];
    //     parse.mockReturnValue(config);
    //     expect(() => new SmartMapUtil({ configFilePath: '/path/to/config.xlsx' })).toThrow('Subcategory provided without a major category');
    // });

    // test('downloads GeoJSON file if URL is provided', async () => {
    //     const config = [{ 'レイヤー名': 'layer1', 'データ参照先': 'http://example.com/data1.geojson', 'データ種別': 'geojson' }];
    //     parse.mockReturnValue(config);
    //     const util = new SmartMapUtil({ configFilePath: '/path/to/config.xlsx', dataDir: '/path/to/data' });
    //     await util.convertToGeoJSON();
    //     expect(downloadFile).toHaveBeenCalledWith('http://example.com/data1.geojson', expect.stringContaining('/path/to/data/layer1.geojson'));
    // });

    // test('converts Shape file to GeoJSON', async () => {
    //     const config = [{ 'レイヤー名': 'layer2', 'データ参照先': '/path/to/data2.shp', 'データ種別': 'shape' }];
    //     parse.mockReturnValue(config);
    //     const util = new SmartMapUtil({ configFilePath: '/path/to/config.xlsx', dataDir: '/path/to/data' });

    //     // Mocking shapeToGeoJSON function
    //     const shapeToGeoJSON = jest.fn();
    //     util.convertToGeoJSON = shapeToGeoJSON;

    //     await util.convertToGeoJSON();
    //     expect(shapeToGeoJSON).toHaveBeenCalledWith('/path/to/data2.shp', expect.stringContaining('/path/to/data/layer2.geojson'), 'EPSG:4326');
    // });

});
