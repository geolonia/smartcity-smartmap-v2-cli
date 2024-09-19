# smartcity-menu-experiment-cli


 [スマートマップデータテンプレート（Excel）](https://docs.google.com/spreadsheets/d/1IQKC5dRNlWaINs0BkmYamaLQIgX6kQuLLzN-nQryBlU/edit?usp=sharing) を読み込んで、[smartcity-menu-experiment](https://github.com/geolonia/smartcity-menu-experiment)で使用する、メニュー用設定ファイルと、ベクトルタイルを生成する CLI ツールです。


## 使い方

```
$ npm install
$ ./main.sh <input_directory> <config_file_excel>
```

- `input_directory` には、ベクトルタイルを生成する元データが格納されているディレクトリを指定します。
- `config_file_excel` には、メニュー用設定ファイルのパスを指定します。

```
$ ./main.sh ./data ./data/smartcity-menu.xlsx
```