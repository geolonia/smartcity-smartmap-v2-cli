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
shapeExtensions=("shp" "dbf" "shx" "prj" "cpg" "SHP" "DBF" "SHX" "PRJ" "CPG")


jq -c '.[]' $json_file | while read item; do

  # 各フィールドを取り出す
  tileLayer=$(echo $item | jq -r '.["タイルレイヤー名"]')
  dataType=$(echo $item | jq -r '.["データ種別"]')
  reference=$(echo $item | jq -r '.["データ参照先"]')
  tippecanoe_opts=$(echo $item | jq -r '.["Tippecanoeオプション"]')

  # --------------------------------------------------
  # 1. データ参照先で URL で指定されたファイルをダウンロード（GeoJSONとCSV、Shapefileに対応）
  # --------------------------------------------------
  if [[ $reference =~ ^https://.*$ ]] && [[ $dataType == "geojson" || $dataType == "csv" || $dataType == "shp" ]]; then

    # Shapefileの場合は関連ファイルもダウンロード
    if [[ $dataType == "shp" ]]; then

      for ext in "${shapeExtensions[@]}"; do
        # ファイル拡張子を設定
        extension="$ext"
        
        # ダウンロード先のファイルパスを設定
        download_path="$input_directory/$tileLayer.$extension"
        
        # URLを関連ファイルの拡張子に変更
        reference_file="${reference%.*}.$extension"
        
        # ダウンロード先のファイルが存在しない場合のみダウンロード
        if [ ! -f "$download_path" ]; then
          echo "Downloading $tileLayer.$extension ..."
          
          # curlでステータスコードを取得し、ダウンロード
          http_status=$(curl -L -H "Cache-Control: no-cache" -s -o "$download_path" -w "%{http_code}" "$reference_file")
          echo "Status: $http_status"

          # ステータスコードが200番台または300番台でなければファイルを削除
          if [ "$http_status" -eq 200 ]; then
            echo "$tileLayer.$extension downloaded successfully."
          else
            echo "Failed to download $tileLayer.$extension (Status: $http_status). Removing incomplete file."
            rm -f "$download_path"
          fi
        else
          echo "$tileLayer.$extension already exists."
        fi
      done
      
    else
      # 他のファイルタイプ（GeoJSONやCSV）の場合
      extension="${dataType}"
      download_path="$input_directory/$tileLayer.$extension"

      if [ ! -f "$download_path" ]; then
        echo "Downloading $tileLayer.$extension ..."
        curl -H "Cache-Control: no-cache" -s -o $download_path $reference
      else
        echo "$tileLayer.$extension already exists."
      fi
    fi
  fi

  # --------------------------------------------------
  # 2. タイルレイヤー名を元にファイルをリネーム
  # --------------------------------------------------
  # Shape の場合
  if [ "$dataType" = "shp" ]; then

    reference_file=$(basename "$reference" ".shp")
    for ext in "${shapeExtensions[@]}"; do
      # -iname を使って拡張子の大文字小文字を無視して検索し、結果を小文字に変換
      src=$(find "$input_directory" -iname "$reference_file.$ext" -print -quit)
      dst="$input_directory/$tileLayer.${ext,,}"  # ${ext,,}で拡張子を小文字に変換

      # 移動元と移動先が同じか確認
      if [ -n "$src" ] && [ "$src" != "$dst" ]; then
          echo "ファイル名を変更: $src to $dst"
          mv "$src" "$dst"
      else
          echo "移動元と移動先が同じファイルです。操作をスキップします。"
      fi
    done
  fi

  # GeoJSON と CSV の場合（ローカルファイルをリネーム）
  if [ -f "$input_directory/$reference" ] && [[ $dataType == "geojson" || $dataType == "csv" ]]; then
    mv "$input_directory/$reference" "$input_directory/$tileLayer.$dataType"
  fi

  # Shift_JIS のCSVを UTF-8 に変換
  if [ $dataType = "csv" ] && [ -f "$input_directory/$tileLayer.csv" ]; then
    csv="$input_directory/$tileLayer.csv"
    
    encoding=$(nkf --guess "$csv" | sed 's/ .*//')

    if [[ $encoding != "UTF-8" ]]; then
        iconv -f "$encoding" -t UTF-8 "$csv" > "${csv}.tmp"
        mv "${csv}.tmp" "$csv"
        echo "Converted $encoding to UTF-8: $csv"
    fi
  fi

  # --------------------------------------------------
  # 3. データを ndgeojson に変換
  # --------------------------------------------------

  # Shape の場合
  s_srs_args=""

  if [ $dataType = "shp" ]; then
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
    
    shpfile="$input_directory/$tileLayer.shp"
    temp_file="$input_directory/$tileLayer-temp.shp"

    # EPSG:4326 で UTF-8 の Shapefile に変換
    if [ ! -f "$prj_file" ]; then
        # .prj ファイルがない場合、EPSG:6676 を使用して変換
        ogr2ogr -f "ESRI Shapefile" $s_srs_args -t_srs EPSG:4326 -lco ENCODING=UTF-8 "$temp_file" "$shpfile"
    else
        # .prj ファイルがある場合はそのまま変換
        ogr2ogr -f "ESRI Shapefile" -t_srs EPSG:4326 -lco ENCODING=UTF-8 "$temp_file" "$shpfile"
    fi

    # ndgeojson に変換
    ogr2ogr -f geojsonseq "$input_directory/$tileLayer.ndgeojson" "$temp_file"

    echo "Convert Shape to  ${tileLayer}.ndgeojson"
  fi

  # GeoJSON と CSV の場合
  if [[ $dataType = "geojson" || $dataType = "csv" ]]; then
    inputFile="$input_directory/$tileLayer.$dataType"

    if [ $dataType = "geojson" ]; then
      ogr2ogr -f geojsonseq -t_srs EPSG:4326 "$input_directory/$tileLayer.ndgeojson" "$inputFile"

    elif [ $dataType = "csv" ]; then

      # 経度と緯度の列名候補を正規表現で定義
      longitude_patterns="longitude|lng|lon|経度\(度：世界測地系\）|経度\（度：世界測地系\）|経度\(10進\)"
      latitude_patterns="latitude|lat|緯度\（度：世界測地系\）|緯度\（度：世界測地系\）|緯度\(10進\)"

      # CSV の場合は経度と緯度の列名変換処理
      tempFile="$input_directory/${tileLayer}_temp.csv"

      # 1行目の列名を変換してから出力
      sed -E "1s/($longitude_patterns)/経度/g; 1s/($latitude_patterns)/緯度/g" "$inputFile" > "$tempFile"

      # 変換した一時ファイルを使用して ogr2ogr コマンドを実行
      ogr2ogr -f geojsonseq -skipfailures -s_srs EPSG:4326 -t_srs EPSG:4326 "$input_directory/$tileLayer.ndgeojson" "$tempFile" -oo X_POSSIBLE_NAMES=経度 -oo Y_POSSIBLE_NAMES=緯度
      
      # 一時ファイルを削除
      rm "$tempFile"
    fi
    
    echo "Convert ${inputFile} to  ${base}.ndgeojson"
  fi

  # --------------------------------------------------
  # 4. ndgeojson をタイルに変換
  # --------------------------------------------------

  # デフォルトのTippecanoeオプション
  TIPPECANOE_OPTS=(
      "-M" "500000" # タイルサイズを500KBに制限
      "--no-tile-stats" # タイル統計情報を生成しない
      "-Z" "8"
      "-z" "14"
      "--simplify-only-low-zooms" # 低ズームレベルのみ簡略化
      "--cluster-distance=5" # 10 ピクセル以内はクラスタリング
      "--cluster-densest-as-needed" # 重複がある場合はクラスタリング
      "--force"
  )

  if [[ "$dataType" != "fiware" && "$dataType" != "raster" ]]; then
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
    "-Z" "8" # このズーム以下のタイルはコピーしない
    "-z" "14" # このズーム以上のタイルはコピーしない
    "--force"
)

IFS=$'\n' mbtiles_files=($(find . -name "*.mbtiles" -print0 | xargs -0 -n1 echo))
echo "マージする .mbtiles ファイル: ${mbtiles_files[@]}"
merged_file="output.mbtiles"
tile-join -o "$merged_file" "${TILEJOIN_OPTS[@]}" "${mbtiles_files[@]}"

# # 処理が終わったら .ndgeojson と .mbtiles ファイルを削除
# find . -name "*.ndgeojson" -delete
# find . -name "*.mbtiles" ! -name "$merged_file" -delete


# --------------------------------------------------
# 6. メニューを生成
# --------------------------------------------------

node ./bin/configToMenuYAML.js $json_file "app.yml"