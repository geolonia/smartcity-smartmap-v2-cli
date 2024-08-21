const { exec: _exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const exec = promisify(_exec);
const createTempDir = require("./tempDir");


const geojsonToMBTile = async (config, inputDir, outputPath) => {
  const mbtilesPaths = [];

  const tmpdir = await createTempDir('mbtiles-');

  for (let i = 0; i < config.length; i++) {
    const data = config[i];

    // fiwareの場合はスキップ
    if (data['データ種別'] == 'fiware') {
      continue;
    }

    const fileName = path.basename(data.geojsonPath, '.geojson');
    const mbtilesPath = path.join(tmpdir, `${fileName}.mbtiles`);
    console.log(`処理中 ${data['タイルレイヤー名']}...`);

    if (!data['タイルレイヤー名']) {
      throw new Error('タイルレイヤー名 が指定されていません');
    }
    
    await exec([
      'tippecanoe',
      '-o', mbtilesPath,
      '-Z0', '-z14',
      '-l', data['タイルレイヤー名'],
      '--cluster-distance=10',
      '--cluster-densest-as-needed',
      '--no-feature-limit',
      '--no-tile-size-limit',
      '--tile-stats-values-limit=0',
      data.geojsonPath,
    ].map(x => `'${x}'`).join(" "));

    mbtilesPaths.push(mbtilesPath);
  }

  if (mbtilesPaths.length > 0) {
    await exec([
      'tile-join',
      '--force',
      '-o', outputPath,
      '--overzoom',
      '--no-tile-size-limit',
      '--tile-stats-values-limit=0',
      ...mbtilesPaths,
    ].map(x => `'${x}'`).join(" "));

    console.log(`MBTiles を ${outputPath} に出力しました。`);
  } else {
    console.log(`GeoJSON が ${inputDir} に見つかりませんでした。`);
  }

  await fs.promises.rm("tmp", { recursive: true });
}

module.exports = geojsonToMBTile;