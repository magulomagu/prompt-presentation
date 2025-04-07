#!/bin/bash

# APIテスト用のcurlコマンドスクリプト
# 4種類のエクスポート形式（HTML、PDF、SVG、PNG）をテストします

# 基本URL（ローカル開発環境用）
BASE_URL="http://localhost:3000"

# テーマの配列
THEMES=("モダン" "コーポレート" "クリエイティブ" "ミニマル" "モノクローム")

# 出力ディレクトリを作成
OUTPUT_DIR="./export-samples"
mkdir -p $OUTPUT_DIR

echo "=== プレゼンテーションエクスポートテスト ==="
echo "出力ディレクトリ: $OUTPUT_DIR"
echo ""

# 各テーマでテスト
for THEME in "${THEMES[@]}"
do
  echo "テーマ「$THEME」のエクスポートをテスト中..."
  
  # 1. HTML形式でエクスポート
  echo "  HTML形式でエクスポート中..."
  curl -s "$BASE_URL/api/test-export?theme=$THEME&format=html" > "$OUTPUT_DIR/$THEME-presentation.html"
  echo "    保存先: $OUTPUT_DIR/$THEME-presentation.html"
  
  # 2. PDF形式でエクスポート
  echo "  PDF形式でエクスポート中..."
  curl -s "$BASE_URL/api/export-pdf?theme=$THEME" > "$OUTPUT_DIR/$THEME-presentation.pdf"
  echo "    保存先: $OUTPUT_DIR/$THEME-presentation.pdf"
  
  # 3. SVG形式でエクスポート（最初のスライド）
  echo "  SVG形式でエクスポート中（スライド1）..."
  curl -s "$BASE_URL/api/export-svg?theme=$THEME&slide=0" > "$OUTPUT_DIR/$THEME-slide1.svg"
  echo "    保存先: $OUTPUT_DIR/$THEME-slide1.svg"
  
  # 4. PNG形式でエクスポート（最初のスライド）
  echo "  PNG形式でエクスポート中（スライド1）..."
  curl -s "$BASE_URL/api/export-png?theme=$THEME&slide=0" > "$OUTPUT_DIR/$THEME-slide1.png"
  echo "    保存先: $OUTPUT_DIR/$THEME-slide1.png"
  
  echo "テーマ「$THEME」のエクスポート完了"
  echo ""
done

echo "すべてのエクスポートテストが完了しました"
echo "出力ファイルは $OUTPUT_DIR ディレクトリにあります"
