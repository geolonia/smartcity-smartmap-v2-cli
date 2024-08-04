const path = require('path');
const SmartMapUtil = require('./lib/SmartMapUtil');
const parse  = require("./lib/parseExcel");
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

if (!args.configPath || !args.inputPath) {
  console.error('Usage: npm run build -- --configPath <config_file> --inputPath <input_data_dir>');
  process.exit(1);
}

const main = async () => {

    const config = parse(args.configPath);
    const smartMapUtil = new SmartMapUtil(
        {
            config: config,
            inputDir: args.inputPath,
            outputDir: args.outputPath,
            mbtileName: args.mbtileName,
            crs: args.crs || 'EPSG:6672' // 仮で平面直角座標 4系（香川県）を指定
        }
    );

    await smartMapUtil.build();
};

main();