# smartcity-menu-experiment-cli


 [スマートマップデータテンプレート（Excel）](https://docs.google.com/spreadsheets/d/1IQKC5dRNlWaINs0BkmYamaLQIgX6kQuLLzN-nQryBlU/edit?usp=sharing) を読み込んで、[smartcity-menu-experiment](https://github.com/geolonia/smartcity-menu-experiment)で使用する、メニュー用設定ファイルと、ベクトルタイルを生成する CLI ツールです。


## 使い方

```
$ npm install
$ npm run build -- --config smartcity-data.xlsx --input ./data
> MBTiles を path/smartcity.mbtiles に出力しました。
> メニューファイルを path/menu.yml に出力しました。
> 処理が完了しました
```

- `--config` には、メニュー用設定ファイルのパスを指定します。
- `--input` には、ベクトルタイルを生成する元データが格納されているディレクトリを指定します。



## メモ

1. Excel をシェルで読み込める形式に変更
2. データ（GeoJSON）をダウンロードして、`./data` に配置
3. 指定されたタイルレイヤー名 or ファイル名 + 指定されたTippecanoeのオプションで、MBTiles を生成
4. メニューファイルを生成