const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const configToMenuYAML = (config, outputFile) => {
  const menu = {};

  config.forEach(item => {
    const { 大カテゴリー, 中カテゴリー, レイヤー名, geojsonPath } = item;

    if (!menu[大カテゴリー]) {
      menu[大カテゴリー] = {};
    }

    if (!menu[大カテゴリー][中カテゴリー]) {
      menu[大カテゴリー][中カテゴリー] = [];
    }

    const existingLayer = menu[大カテゴリー][中カテゴリー].find(layer => Object.keys(layer)[0] === レイヤー名);
    const fileName = path.basename(geojsonPath, '.geojson');

    if (existingLayer) {
      existingLayer[レイヤー名].include.push(fileName);
    } else {
      menu[大カテゴリー][中カテゴリー].push({
        [レイヤー名]: {
          include: [fileName]
        }
      });
    }
  });

  console.log(JSON.stringify(menu));

  // YAMLに変換
  const yamlStr = yaml.dump(menu, { 
    lineWidth: -1,
    noRefs: true,
    noCompatMode: true,
    quotingType: '"'
  });

  // ファイルに書き込み
  fs.writeFileSync(outputFile, yamlStr);
  console.log(`${outputFile} has been generated successfully!`);
}

module.exports = configToMenuYAML;