const { exec: _exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const klaw = require('klaw');
const path = require('path');
const exec = promisify(_exec);
const uuid = require('uuid');


const geojsonToMBTile = async (inputDir, outputPath) => {
  const mbtilesPaths = [];

  await fs.promises.mkdir("tmp", { recursive: true });
  const tmpdir = await fs.promises.mkdtemp(path.join("tmp", `smart-city-`));

  for await (const file of klaw(inputDir, { depthLimit: -1 })) {

    if (file.path.endsWith(".geojson")) {
      const fileName = path.basename(file.path, '.geojson');

      // 同名ファイルがある場合にエラーが出るので、uuidをつける
      const tileFileName = fileName + "-" + uuid.v4();
      console.log(`Processing ${fileName}...`);

      const geojsonPath = file.path;
      const mbtilesPath = path.join(tmpdir, `${tileFileName}.mbtiles`);

      await exec([
        'tippecanoe',
        '-o', mbtilesPath,
        '-Z0', '-z14',
        '-l', fileName,
        '--cluster-distance=10',
        '--cluster-densest-as-needed',
        '--no-feature-limit',
        '--no-tile-size-limit',
        '--tile-stats-values-limit=0',
        geojsonPath,
      ].map(x => `'${x}'`).join(" "));

      mbtilesPaths.push(mbtilesPath);
    }
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

  // tmpdir の中のファイルをlist する
  const files = await fs.promises.readdir(tmpdir);
  console.log(files);

  await fs.promises.rm(tmpdir, { recursive: true });
}

module.exports = geojsonToMBTile;