const fs = require('fs');
const yaml = require('js-yaml');

console.log('configToMenuYAML.js');

// タイルレイヤー名から3桁の短縮IDを生成する関数
const generateShortId = (tileLayerName) => {
  const hash = Array.from(tileLayerName)
    .reduce((acc, char) => acc + char.charCodeAt(0), 0); // Unicodeの合計を計算
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return (
    alphabet[hash % 26] +
    alphabet[Math.floor((hash / 26) % 26)] +
    alphabet[Math.floor((hash / 676) % 26)]
  ); // 3文字のIDを生成
};

const createData = (id, item, isCustomDataType) => {
  const data = { 
    id: id,
    type: 'data',
    tileId: item.タイルレイヤー名,
  };

  if (item.レイヤー色) {
    data.metadata = { color: item.レイヤー色 };
  }

  if (isCustomDataType && isCustomDataType !== 'fiware') {
    data.metadata = {
      dataType: item.データ種別,
      tileUrl: item.データ参照先,
    }
  }

  if (item.タイルレイヤー名) {
    data.shortId = generateShortId(item.タイルレイヤー名)
  }

  return data;
}

const configToMenuYAML = (config, outputFile) => {
  const app = {
    name: 'スマートマップ',
    zoom: 12,
    center: [138.29255, 34.83344],
    minZoom: 9,
    maxZoom: 20,
    menus: {
      都市情報一覧: {
        metadata: {
          tileUrl: 'この値を実際のタイルに置き換えてください',
        },
        items: {}
      }
    }
  };

  const menu = app.menus['都市情報一覧'].items;

  config.forEach(item => {
    const { 大カテゴリー, 中カテゴリー, メニュータイトル, データ種別 } = item;
    console.log(item);

    const isCustomDataType = データ種別 === 'raster' ||  データ種別 === 'vector' || データ種別 === 'datapng' || データ種別 === 'fiware';

    if (!大カテゴリー && 中カテゴリー) {
      throw new Error('中カテゴリーを指定する場合は、大カテゴリーも指定してください');
    }

    // 大カテゴリーがない場合は追加
    if (大カテゴリー && !menu[大カテゴリー]) {
      menu[大カテゴリー] = { id: 大カテゴリー, type: 'category', items: {} };
    }

    // 中カテゴリーがない場合は追加
    if (中カテゴリー && !menu[大カテゴリー].items[中カテゴリー]) {
      menu[大カテゴリー].items[中カテゴリー] = { id: `${大カテゴリー}/${中カテゴリー}`, type: 'category', items: {} };
    }

    if (メニュータイトル) {

      // 大・中カテゴリとメニュータイトルがある場合
      if (大カテゴリー && 中カテゴリー && メニュータイトル) {

        if (menu[大カテゴリー].items[中カテゴリー].items[メニュータイトル]) {
          throw new Error(`メニュータイトル: ${大カテゴリー}/${中カテゴリー}/${メニュータイトル} は重複しています`);
        }

        const data = createData(`${大カテゴリー}/${中カテゴリー}/${メニュータイトル}`, item, isCustomDataType);

        menu[大カテゴリー].items[中カテゴリー].items[メニュータイトル] = data;
        return;
      }

      if (大カテゴリー && メニュータイトル) {

        if (menu[大カテゴリー].items[メニュータイトル]) {
          throw new Error(`メニュータイトル: ${大カテゴリー}/${メニュータイトル} は重複しています`);
        }

        const data = createData(`${大カテゴリー}/${メニュータイトル}`, item, isCustomDataType);
        menu[大カテゴリー].items[メニュータイトル] = data;
        return;
      }

      if (メニュータイトル) {

        if (menu[メニュータイトル]) {
          throw new Error(`メニュータイトル: ${メニュータイトル} は重複しています`);
        }

        const data = createData(メニュータイトル, item, isCustomDataType);
        menu[メニュータイトル] = data;

        return;
      }
    } else {
      throw new Error('メニュータイトル が指定されていません');
    }
  });

  const yamlStr = yaml.dump(app, {
    lineWidth: -1,
    noRefs: true,
    noCompatMode: true,
    quotingType: '"'
  });

  fs.writeFileSync(outputFile, yamlStr);
  console.log(`メニューファイルを ${outputFile} に出力しました。`);
}

const config_file = process.argv[2];
const output_file = process.argv[3];

if (!config_file || !output_file) {
  console.error('Usage: node configToMenuYAML <config_file> <output_file>');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(config_file, 'utf8'));
configToMenuYAML(config, output_file);
