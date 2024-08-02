const fs = require('fs');
const yaml = require('js-yaml');

const configToMenuYAML = (data, outputFile) => {
  const menu = {};

  for (let i = 0; i < data.length; i++) {
      const { 大カテゴリー, 中カテゴリー, レイヤー名 } = data[i];

      if (!menu[大カテゴリー]) {
          menu[大カテゴリー] = {};
      }

      if (!menu[大カテゴリー][中カテゴリー]) {
          menu[大カテゴリー][中カテゴリー] = [];
      }

      if (!menu[大カテゴリー][中カテゴリー].includes(レイヤー名)) {
          menu[大カテゴリー][中カテゴリー].push(レイヤー名);
      }
  }

  // YAMLに変換
  const yamlStr = yaml.dump(menu, { lineWidth: -1 });

  // ファイルに書き込み
  fs.writeFileSync(outputFile, yamlStr);
  console.log(`${outputFile} has been generated successfully!`);
}

module.exports = configToMenuYAML;