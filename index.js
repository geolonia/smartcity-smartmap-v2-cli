const path = require('path');
const SmartMapUtil = require('./lib/SmartMapUtil');
const parse  = require("./lib/parseExcel");
const minimist = require('minimist');
const error = require('./lib/error');

const args = minimist(process.argv.slice(2));

if (!args.config || !args.input) {
  error('Usage: npm run build -- --config <config_file> --input <input_data_dir>');
}

const main = async () => {

    const config = parse(args.config);
    const smartMapUtil = new SmartMapUtil(
        {
            config: config,
            inputDir: args.input,
            outputDir: args.output,
            mbtileName: args.mbtileName,
            crs: args.crs || 'EPSG:6672' // 仮で平面直角座標 4系（香川県）を指定
        }
    );

    await smartMapUtil.build();
};

main();