const path = require('path');
const SmartMapUtil = require('./lib/SmartMapUtil');

// データ階層ファイルのパス
const configFilePath = process.argv[2];
const InputPath = process.argv[3];
const OutputPath = process.argv[4]
const mbtileName = process.argv[5];

const main = async () => {

    const smartMapUtil = new SmartMapUtil(
        {
            configFilePath: path.join(__dirname, configFilePath || 'smartcity-data.xlsx'),
            inputDir: path.join(__dirname, InputPath || 'data'),
            outputDir: path.join(__dirname, OutputPath || ''),
            mbtileName: mbtileName || 'smartcity.mbtiles',
            crs: 'EPSG:6672'
        }
    );

    await smartMapUtil.build();
};

main();