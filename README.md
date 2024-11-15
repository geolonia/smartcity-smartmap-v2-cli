# smartcity-smartmap-v2-cli


 [スマートマップデータテンプレート（Excel）](https://docs.google.com/spreadsheets/d/1IQKC5dRNlWaINs0BkmYamaLQIgX6kQuLLzN-nQryBlU/edit?usp=sharing) を読み込んで、[smartcity-smartmap-v2](https://github.com/geolonia/smartcity-smartmap-v2) で使用する、メニュー用設定ファイルと、ベクトルタイルを生成する CLI ツールです。


## Excel の列について
- 大カテゴリー：第1位置階層のカテゴリ名を入力
- 中カテゴリー：第2位置階層のカテゴリ名を入力
- メニュータイトル：メニューのタイルを入力
- タイルレイヤー名：全データでユニークなIDを入力（この値をタイルのソースレイヤー名として使用します）
- データ種別：shp、geojson、csv、datapng に対応
- データ参照先：URLでデータの参照先を指定。（Shapeファイルの場合は、.shp の URLを指定）
- Tippecanoeオプション
- レイヤー色：hexでカラーコードを指定すると、その色が反映されます


## 要件
- GDAL（ogr2ogr）、Tippecanoe、nkf

```bash
$ brew install gdal tippecanoe nkf
```

## 使い方

```bash
$ npm install
$ ./main.sh <input_directory> <config_file_excel> [CRS]
```

- `input_directory` には、ベクトルタイルを生成する元データが格納されているディレクトリを指定します。
- `config_file_excel` には、メニュー用設定ファイルのパスを指定します。

```bash
$ ./main.sh ./data ./スマートマップ地理空間データ設定.xlsx EPSG:6676 // 8系
```

## 試してみる

まずは、以下のコマンドをして下さい。output.mbtiles と app.yml が生成されます。

```bash
$ git@github.com:geolonia/smartcity-smartmap-v2-cli.git
$ cd smartcity-smartmap-v2-cli
$ npm install
$ ./main.sh . ./スマートマップ地理空間データ設定.xlsx EPSG:6677
```

