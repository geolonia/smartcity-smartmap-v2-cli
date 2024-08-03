const SmartMapUtil = require('../lib/SmartMapUtil');
const fs = require('fs');
const path = require('path');
const { isExist, getPath, parseYaml } = require('./testUtils');
const parse = require('../lib/parseExcel');

const config = parse(path.join(__dirname, 'data/smartcity-data.xlsx')); // Excel のデータを読み込む
const inputData = path.join(__dirname, 'data'); // データファイルのパス

describe('基本的な使い方', () => {


  test('タイルとメニュー用ファイルを生成', async () => {

    const util = new SmartMapUtil({
      config: config,
      inputDir: inputData
    });

    await util.build();

    const tileExists = isExist('smartcity.mbtiles');
    const menu = parseYaml('menu.yml');    

    expect(tileExists).toBe(true);
    expect(menu).toEqual({
      '都市計画情報': { '用途地域': [ '第一種低層住居専用地域', '第一種中高層住居専用地域' ] },
      '施設情報': { 'くらし': [ 'AED設置場所', '公衆無線LANアクセスポイント' ] }
    });
  });


  test('対応データ: Shape、GeoJSON', async () => {

    const excel = [
      {
        '大カテゴリー': '',
        '中カテゴリー': '',
        'レイヤー名': 'AED設置場所',
        'データ種別': 'geojson',
        'データ参照先': 'https://opendata.takamatsu-fact.com/aed_location/data.geojson'
      },
      {
        '大カテゴリー': '',
        '中カテゴリー': '',
        'レイヤー名': '第一種中高層住居専用地域',
        'データ種別': 'shape',
        'データ参照先': '第一種中高層住居専用地域'
      },
    ]

    const util = new SmartMapUtil({
      config: excel,
      inputDir: inputData,
    });

    await util.build();

    const tileExists = isExist('smartcity.mbtiles');
    const menuExists = isExist('menu.yml');

    expect(tileExists).toBe(true);
    expect(menuExists).toBe(true);
  });
  

  /**
   * テスト後に生成されたファイルを削除する
   */
  afterEach(() => {
    if (isExist('smartcity.mbtiles')) {
      fs.unlinkSync(getPath('smartcity.mbtiles'));
    }
    if (isExist('menu.yml')) {
      fs.unlinkSync(getPath('menu.yml'));
    }
  });
});