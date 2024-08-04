const path = require('path');
const SmartMapUtil = require('./lib/SmartMapUtil');
const parse  = require("./lib/parseExcel");

// データ階層ファイルのパス
const configPath = process.argv[2];
const inputPath = process.argv[3];
const outputPath = process.argv[4]
const mbtileName = process.argv[5];

const main = async () => {

    const config = parse(configPath);
    const smartMapUtil = new SmartMapUtil(
        {
            config: config,
            inputDir: inputPath,
            outputDir: outputPath,
            mbtileName: mbtileName,
            crs: 'EPSG:6672'
        }
    );

    await smartMapUtil.build();
};

main();