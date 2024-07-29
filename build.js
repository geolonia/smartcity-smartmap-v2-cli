const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');
const { exec } = require('child_process');
const { generateLayerNames, generateMenuYAML, downloadGeoJSON } = require('./utils');

// YAMLファイルのパス
const yamlFilePath = process.argv[2];

if (!yamlFilePath) {
    console.error('使用法: node build.js <YAMLファイル>');
    process.exit(1);
}

// tippecanoeコマンドがインストールされているか確認
exec('tippecanoe --version', (error, stdout, stderr) => {
    if (error) {
        console.error('Tippecanoeがインストールされていません。');
        process.exit(1);
    }
});

// ディレクトリ作成
const dataDir = path.join(__dirname, 'data');
if (fs.existsSync(dataDir)) {
    fs.rmSync(dataDir, { recursive: true });
}
fs.mkdirSync(dataDir);


// mbtiles が存在する場合は削除
const mbtilesPath = path.join(__dirname, 'menu-experiment.mbtiles');
if (fs.existsSync(mbtilesPath)) {
    fs.rmSync(mbtilesPath);
}


// メイン関数
const main = async () => {
    try {

        // YAMLファイルを解析
        const yamlData = YAML.load(yamlFilePath);
        const layers = await generateLayerNames(yamlData, dataDir);

        // メニュー用YAMLを生成
        const menuYAML = generateMenuYAML(yamlData);
        const menuYAMLPath = path.join(__dirname, 'menu.yml');
        fs.writeFileSync(menuYAMLPath, YAML.stringify(menuYAML, 4));
        console.log('Menu YAML generated at:', menuYAMLPath);

        // GeoJSONファイルをダウンロード
        for (const layer of layers) {
            console.log(`Downloading ${layer.layerName} from ${layer.url}...`);
            await downloadGeoJSON(layer.url, layer.dataDir);
        }

        const tippecanoeOptions = layers.map(layer => `-L ${layer.layerName}:data/${layer.filename}`);
        const tippecanoeCommand = `tippecanoe -o menu-experiment.mbtiles ${tippecanoeOptions.join(' ')}`;
        
        console.log('Generating vector tiles with Tippecanoe...');

        exec(tippecanoeCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Tippecanoe: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Tippecanoe stderr: ${stderr}`);
                return;
            }
            console.log('Vector tile generation complete.');
            console.log(stdout);
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

main();
