#!/usr/bin/env bash
set -ex

# 引数が指定されているか確認
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "使用方法: $0 <input_directory> <config_file_excel> [crs]"
  exit 1
fi

# 引数で指定されたディレクトリを変数に代入
input_directory="$1"
# 末尾にスラッシュがある場合は削除
input_directory=${input_directory%/}
crs="$3"

# ディレクトリが存在するか確認
if [ ! -d "$input_directory" ]; then
  echo "ディレクトリ $input_directory は存在しません。"
  exit 1
fi

# config ファイルが存在するか確認
if [ ! -f "$2" ]; then
  echo "ファイル $2 は存在しません。"
  exit 1
fi

node ./bin/xlsx2json.js $2

json_file="data.json"

# 全ての不要なファイルを削除
find . -name "*.mbtiles" | xargs -I '{}' rm "{}"
find . -name "*.ndgeojson" | xargs -I '{}' rm "{}"

jq -c '.[]' $json_file | while read item; do
  # 各フィールドを取り出す
  tileLayer=$(echo $item | jq -r '.["タイルレイヤー名"]')
  dataType=$(echo $item | jq -r '.["データ種別"]')
  reference=$(echo $item | jq -r '.["データ参照先"]')
  tippecanoe_opts=$(echo $item | jq -r '.["Tippecanoeオプション"]')



  # --------------------------------------------------
  # 1. データ参照先で URL で指定されたファイルをダウンロード（現状、GeoJSONのみ対応）
  # --------------------------------------------------
  if [[ $reference =~ ^https://.*$ ]] && [ $dataType = "geojson" ]; then  

    # ダウンロード先のファイルパスを設定
    download_path="$input_directory/$tileLayer.geojson"

    # ダウンロード先のファイルが存在しない場合のみダウンロード
    if [ ! -f "$download_path" ]; then
      echo "Downloading $tileLayer.geojson ..."
      curl -s -o $download_path $reference
    elif [ -f "$download_path" ]; then
      echo "$tileLayer.geojson already exists."
      # exit 1;
    fi
  fi


  # --------------------------------------------------
  # 2. タイルレイヤー名を元にファイルをリネーム
  # --------------------------------------------------

  # Shape の場合
  if [ $dataType = "shape" ]; then
    extensions=("shp" "prj" "cpg" "dbf" "sbn" "fbn" "ain" "ixs" "mxs" "atx" "shp.xml" "shx" "sbx")
    reference_file=$(basename $reference ".shp")
    for ext in "${extensions[@]}"; do
      file=$(find "$input_directory" -iname "$reference_file.$ext" -print -quit)
      echo $file
      if [ -n "$file" ]; then
        echo "Renaming $file to $input_directory/$tileLayer.$ext"
        mv "$file" "$input_directory/$tileLayer.$ext"
      fi
    done
  fi

  # GeoJSON の場合
  if [ -f "$input_directory/$reference" ] && [ $dataType = "geojson" ]; then
    mv "$input_directory/$reference" "$input_directory/$tileLayer.geojson"
  fi

  # --------------------------------------------------
  # 3. データを ndgeojson に変換
  # --------------------------------------------------

  # Shape の場合
  s_srs_args=""

  if [ $dataType = "shape" ]; then
    # .prj ファイルが Shift_JIS だと ogr2ogr でエラーが出るので UTF-8 に変換
    prj_file="$input_directory/$tileLayer.prj"
    if [ -f $prj_file ]; then
        encoding=$(nkf --guess $prj_file)
        if [ "$encoding" = "Shift_JIS" ]; then
            nkf --overwrite -w $prj_file
        fi
    elif [ -n "$crs" ]; then
      s_srs_args="-s_srs $crs"
    fi
    
    # TODO cpg ファイルがあれば使うように修正
    shpfile="$input_directory/$tileLayer.shp"
    ogr2ogr -f geojsonseq -oo ENCODING=CP932 $s_srs_args -t_srs crs:84 "$input_directory/$tileLayer.ndgeojson" "$shpfile"
    echo "Convert Shape to  ${tileLayer}.ndgeojson"
  fi

  # GeoJSON の場合
  if [ $dataType = "geojson" ]; then
    geojsonfile="$input_directory/$tileLayer.geojson"

    ogr2ogr -f geojsonseq -oo ENCODING=CP932 -t_srs crs:84 "$input_directory/$tileLayer.ndgeojson" "$geojsonfile"
    echo "Convert GeoJSON to  ${base}.ndgeojson"
  fi

  # --------------------------------------------------
  # 4. ndgeojson をタイルに変換
  # --------------------------------------------------

  # デフォルトのTippecanoeオプション
  TIPPECANOE_OPTS=(
      "-M" "500000" # タイルサイズを500KBに制限
      "--no-tile-stats" # タイル統計情報を生成しない
      "-Z" "9"
      "-z" "10"
      # "-z" "14"
      "--simplify-only-low-zooms" # 低ズームレベルのみ簡略化
      "--cluster-distance=10" # 10 ピクセル以内はクラスタリング
      "--cluster-densest-as-needed" # 重複がある場合はクラスタリング
      "--force"
  )

  if [ $dataType = "shape" ] || [ $dataType = "geojson" ]; then
    ndgeojsonfile="$input_directory/$tileLayer.ndgeojson"
    mbtilesfile="$input_directory/$tileLayer.mbtiles"

    # Tippecanoeオプションが指定されていない場合はデフォルトのオプションを使用
    if [ "$tippecanoe_opts" == "null" ]; then
      tippecanoe -o "$mbtilesfile" "${TIPPECANOE_OPTS[@]}" -l "$tileLayer" -P "$ndgeojsonfile"
    else
      tippecanoe -o "$mbtilesfile" $tippecanoe_opts -l "$tileLayer" -P "$ndgeojsonfile" --force
    fi
  fi

done

# --------------------------------------------------
# 5. 生成した .mbtiles ファイルをマージ
# --------------------------------------------------
TILEJOIN_OPTS=(
    "--overzoom" # オーバーズームを有効
    "--no-tile-size-limit" # タイルサイズの制限を無効
    "--no-tile-stats" # タイル統計情報を生成しない
    "-Z" "9" # このズーム以下のタイルはコピーしない
    "-z" "10"
    # "-z" "15" # このズーム以上のタイルはコピーしない
    "--force"
)

IFS=$'\n' mbtiles_files=($(find . -name "*.mbtiles" -print0 | xargs -0 -n1 echo))
echo "マージする .mbtiles ファイル: ${mbtiles_files[@]}"
merged_file="output.mbtiles"
tile-join -o "$merged_file" "${TILEJOIN_OPTS[@]}" "${mbtiles_files[@]}"

# 処理が終わったら .ndgeojson と .mbtiles ファイルを削除
find . -name "*.ndgeojson" -delete
find . -name "*.mbtiles" ! -name "$merged_file" -delete


# --------------------------------------------------
# 6. メニューを生成
# --------------------------------------------------

node ./bin/configToMenuYAML.js $json_file "menu.yml"