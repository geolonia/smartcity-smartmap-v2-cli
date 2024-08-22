const SmartMapUtil = require('../lib/SmartMapUtil');
const fs = require('fs');
const path = require('path');
const { isExist, getPath, parseYaml } = require('./testUtils');
const parse = require('../lib/parseExcel');

const config = parse(path.join(__dirname, 'data/smartcity-data.xlsx')); // Excel のデータを読み込む
const inputData = path.join(__dirname, 'data'); // データファイルのパス

jest.setTimeout(10000);

describe('基本的な使い方', () => {

  test('タイルとメニュー用ファイルを生成', async () => {

    const util = new SmartMapUtil({ config: config, inputDir: inputData });
    await util.build();

    const tileExists = isExist('smartcity.mbtiles');
    expect(tileExists).toBe(true);

    const menu = parseYaml('menu.yml');
    expect(menu).toEqual({
      "都市計画情報": {
        "type": "category",
        "items": {
          "用途地域": {
            "type": "category",
            "items": {
              "第一種低層住居専用地域(60_40)": {
                "type": "data",
                "tileId": "第一種低層住居専用地域(60_40)"
              },
              "第一種低層住居専用地域(80_50)": {
                "type": "data",
                "tileId": "第一種低層住居専用地域(80_50)"
              },
              "第一種中高層住居専用地域 ": {
                "type": "data",
                "tileId": "第一種中高層住居専用地域 "
              }
            }
          }
        }
      },
      "施設情報": {
        "type": "category",
        "items": {
          "くらし": {
            "type": "category",
            "items": {
              "AED設置場所": {
                "type": "data",
                "tileId": "AED設置場所"
              },
              "公衆無線LANアクセスポイント": {
                "type": "data",
                "tileId": "公衆無線LAN"
              }
            }
          }
        }
      },
      "防災情報": {
        "type": "category",
        "items": {
          "IoT センサー": {
            "type": "category",
            "items": {
              "冠水状況": {
                "type": "data",
                "tileId": "FloodSituation"
              }
            }
          }
        }
      }
    });
  });

  test('対応データは、shape/geojson/fiware', async () => {

    const excel = [
      {
        '大カテゴリー': '',
        '中カテゴリー': '',
        'メニュータイトル': 'AED設置場所',
        'タイルレイヤー名': 'AED設置場所',
        'データ種別': 'geojson',
        'データ参照先': 'https://opendata.takamatsu-fact.com/aed_location/data.geojson'
      },
      {
        '大カテゴリー': '',
        '中カテゴリー': '',
        'メニュータイトル': '第一種中高層住居専用地域',
        'タイルレイヤー名': '第一種中高層住居専用地域',
        'データ種別': 'shape',
        'データ参照先': '第一種中高層住居専用地域'
      },
      {
        '大カテゴリー': '',
        '中カテゴリー': '',
        'メニュータイトル': '冠水状況',
        'タイルレイヤー名': '冠水状況',
        'データ種別': 'fiware',
        'データ参照先': 'FloodSituation'
      }
    ]

    const util = new SmartMapUtil({ config: excel, inputDir: inputData });
    await util.build();

    const tileExists = isExist('smartcity.mbtiles');
    const menuExists = isExist('menu.yml');

    expect(tileExists).toBe(true);
    expect(menuExists).toBe(true);
  });


  test('タイルレイヤー名のみ指定は対応', async () => {

    const excel = [
      {
        '大カテゴリー': '',
        '中カテゴリー': '',
        'メニュータイトル': 'AED設置場所',
        'タイルレイヤー名': 'AED設置場所',
        'データ種別': 'geojson',
        'データ参照先': 'https://opendata.takamatsu-fact.com/aed_location/data.geojson'
      },
    ]

    const util = new SmartMapUtil({ config: excel, inputDir: inputData });
    await util.build();

    const menu = parseYaml('menu.yml');

    expect(menu).toEqual({
      "AED設置場所": {
        "type": "data",
        "tileId": "AED設置場所"
      }
    });
  });

  test('大カテゴリーとタイルレイヤー名を指定も対応', async () => {
    const excel = [
      {
        '大カテゴリー': '施設情報',
        '中カテゴリー': '',
        'メニュータイトル': 'AED設置場所',
        'タイルレイヤー名': 'AED設置場所',
        'データ種別': 'geojson',
        'データ参照先': 'https://opendata.takamatsu-fact.com/aed_location/data.geojson'
      },
    ]

    const util = new SmartMapUtil({ config: excel, inputDir: inputData });
    await util.build();

    const menu = parseYaml('menu.yml');
    expect(menu).toEqual({
      "施設情報": {
        "type": "category",
        "items": {
          "AED設置場所": {
            "type": "data",
            "tileId": "AED設置場所"
          }
        }
      }
    });
  });

  test('中カテゴリーとタイルレイヤー名の組み合わせは非対応', async () => {
    const excel = [
      {
        '大カテゴリー': '',
        '中カテゴリー': 'くらし',
        'メニュータイトル': 'AED設置場所',
        'タイルレイヤー名': 'AED設置場所',
        'データ種別': 'geojson',
        'データ参照先': 'https://opendata.takamatsu-fact.com/aed_location/data.geojson'
      },
    ]

    try {
      const util = new SmartMapUtil({ config: excel, inputDir: inputData });
      await util.build();
      throw new Error('エラーが発生しませんでした');
    } catch (e) {
      expect(e.message).toBe('中カテゴリーを指定する場合は、大カテゴリーも指定してください');
    }

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