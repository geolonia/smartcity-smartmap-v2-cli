const fs = require('fs');
const yaml = require('js-yaml');

const configToMenuYAML = (config, outputFile) => {

  const menu = {};

  config.forEach(item => {
    const { 大カテゴリー, 中カテゴリー, メニュータイトル, タイルレイヤー名, データ種別 } = item;

    if (!大カテゴリー && 中カテゴリー) {
      throw new Error('中カテゴリーを指定する場合は、大カテゴリーも指定してください');
    }

    // 大カテゴリーがない場合は追加
    if (大カテゴリー && !menu[大カテゴリー]) {
      menu[大カテゴリー] = { type: 'category', items: {} };
    }

    // 中カテゴリーがない場合は追加
    if (中カテゴリー && !menu[大カテゴリー].items[中カテゴリー]) {
      menu[大カテゴリー].items[中カテゴリー] = { type: 'category', items: {} };
    }

    if (メニュータイトル) {

      // 大・中カテゴリとメニュータイトルがある場合
      if (大カテゴリー && 中カテゴリー && メニュータイトル) {

        if (menu[大カテゴリー].items[中カテゴリー].items[メニュータイトル]) {
          throw new Error(`メニュータイトル: ${大カテゴリー}/${中カテゴリー}/${メニュータイトル} は重複しています`);
        }

        const data = { type: 'data', tileId: タイルレイヤー名 };
        if (データ種別) {
          data.dataType = データ種別;
        }

        menu[大カテゴリー].items[中カテゴリー].items[メニュータイトル] = data;
        return;
      }

      // 大カテゴリとメニュータイトルがある場合
      if (大カテゴリー && メニュータイトル) {

        if (menu[大カテゴリー].items[メニュータイトル]) {
          throw new Error(`メニュータイトル: ${大カテゴリー}/${メニュータイトル} は重複しています`);
        }

        const data = { type: 'data', tileId: タイルレイヤー名 };
        if (データ種別) {
          data.dataType = データ種別;
        }

        menu[大カテゴリー].items[メニュータイトル] = data;
        return;
      }

      // メニュータイトルのみの場合
      if (メニュータイトル) {

        if (menu[メニュータイトル]) {
          throw new Error(`メニュータイトル: ${メニュータイトル} は重複しています`);
        }

        const data = { type: 'data', tileId: タイルレイヤー名 };
        if (データ種別) {
          data.dataType = データ種別;
        }
        
        menu[メニュータイトル] = data;

        return;
      }
    } else {
      throw new Error('メニュータイトル が指定されていません');
    }
  });

  // YAMLに変換
  const yamlStr = yaml.dump(menu, {
    lineWidth: -1,
    noRefs: true,
    noCompatMode: true,
    quotingType: '"'
  });

  // ファイルに書き込み
  fs.writeFileSync(outputFile, yamlStr);
  console.log(`メニューファイルを ${outputFile} に出力しました。`);
}

module.exports = configToMenuYAML;