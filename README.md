# smartcity-menu-experiment-cli


以下のような YAML ファイルを読み込んで、[smartcity-menu-experiment](https://github.com/geolonia/smartcity-menu-experiment)で使用する、メニュー用設定ファイル（`menu.yml`）と、ベクトルタイルを生成する CLI ツールです。

```yaml
高松市オープンデータ:
  施設情報:
    くらし:
      AED設置場所: https://opendata.takamatsu-fact.com/aed_location/data.geojson
      環境施設: https://opendata.takamatsu-fact.com/environmental_facilities/data.geojson
    観光・産業:
        観光施設: https://opendata.takamatsu-fact.com/tourist_facilities/data.geojson
```

## 使い方

```
$ npm install
$ node build.js data.yml // data.yml は上記のような YAML ファイル
```