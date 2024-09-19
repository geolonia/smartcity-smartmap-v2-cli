const path = require('path');
const SmartMapUtil = require('./lib/SmartMapUtil');
const parse  = require("./lib/parseExcel");
const fs = require('fs');

const args = minimist(process.argv.slice(2));

if (!args.config || !args.input) {
  console.error('Usage: npm run build -- --config <config_file> --input <input_data_dir>');
  process.exit(1);
}

const main = async () => {

    const config = parse(args.config);
    console.log({config});
    // json ファイルに変換
    fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
    // const smartMapUtil = new SmartMapUtil(
    //     {
    //         config: config,
    //         inputDir: args.input,
    //         outputDir: args.output,
    //         mbtileName: args.mbtileName,
    //         crs: args.crs
    //     }
    // );

    // await smartMapUtil.build();
};

main();