const { exec: _exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const exec = promisify(_exec);
const uuid = require('uuid');
const createTempDir = require("./tempDir");


const geojsonToMBTile = async (config, inputDir, outputPath) => {
  const mbtilesPaths = [];

  const tmpdir = await createTempDir('mbtiles-');

  for (let i = 0; i < config.length; i++) {
    const data = config[i];

    const fileName = path.basename(data.geojsonPath, '.geojson');
    console.log(`Processing ${fileName}...`);

    // 同名ファイルがある場合にエラーが出るので、uuidをつける
    const tileFileName = fileName + "-" + uuid.v4();
    const mbtilesPath = path.join(tmpdir, `${tileFileName}.mbtiles`);

    const sourceLayerId = path.basename(data.geojsonPath, '.geojson');

    await exec([
      'tippecanoe',
      '-o', mbtilesPath,
      '-Z0', '-z14',
      '-l', sourceLayerId,
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

    console.log(`Wrote ${outputPath}`);
  } else {
    console.log(`No .geojson files found in ${inputDir}!`);
  }

  await fs.promises.rm("tmp", { recursive: true });
}

module.exports = geojsonToMBTile;