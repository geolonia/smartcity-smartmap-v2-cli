# smartcity-menu-experiment-cli


以下のような [Excel ファイル](https://docs.google.com/spreadsheets/d/1IQKC5dRNlWaINs0BkmYamaLQIgX6kQuLLzN-nQryBlU/edit?usp=sharing) を読み込んで、[smartcity-menu-experiment](https://github.com/geolonia/smartcity-menu-experiment)で使用する、メニュー用設定ファイル（`menu.yml`）と、ベクトルタイルを生成する CLI ツールです。

```
大カテゴリー	中カテゴリー	レイヤー名	データ種別	データ参照先
都市計画情報	用途地域	第一種低層住居専用地域	shape	第一種低層住居専用地域(60_40)
都市計画情報	用途地域	第一種低層住居専用地域	shape	第一種低層住居専用地域(80_50)
都市計画情報	用途地域	第一種中高層住居専用地域 	shape	第一種中高層住居専用地域
施設情報	くらし	AED設置場所	geojson	https://opendata.takamatsu-fact.com/aed_location/data.geojson
施設情報	くらし	公衆無線LANアクセスポイント	geojson	"公衆無線LAN
AED設置場所"
```

## 使い方

```
$ npm install
$ npm run build -- --configPath smartcity-data.xlsx --inputPath ./data
```
- `--configPath` には、メニュー用設定ファイルのパスを指定します。
- `--inputPath` には、ベクトルタイルを生成する元データが格納されているディレクトリを指定します。