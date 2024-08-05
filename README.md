# smartcity-menu-experiment-cli


以下のような [Excel ファイル](https://docs.google.com/spreadsheets/d/1IQKC5dRNlWaINs0BkmYamaLQIgX6kQuLLzN-nQryBlU/edit?usp=sharing) を読み込んで、[smartcity-menu-experiment](https://github.com/geolonia/smartcity-menu-experiment)で使用する、メニュー用設定ファイル（`menu.yml`）と、ベクトルタイルを生成する CLI ツールです。


## 使い方

```
$ npm install
$ npm run build -- --config smartcity-data.xlsx --input ./data
```
- `--configPath` には、メニュー用設定ファイルのパスを指定します。
- `--inputPath` には、ベクトルタイルを生成する元データが格納されているディレクトリを指定します。