# Vercel デプロイガイド

このガイドでは、プロンプトからPPT風資料を生成するWebアプリをVercelにデプロイする手順を説明します。

**更新情報**: モノクロームテーマ（白黒2色のみ）が追加されました。

## 前提条件

- GitHubアカウント
- Vercelアカウント（無料プランで可）
- OpenAI APIキー（オプション）
- Google Gemini APIキー（オプション）

## 1. GitHubリポジトリの準備

### 1.1 GitHubリポジトリの作成

1. [GitHub](https://github.com/)にログインします
2. 右上の「+」ボタンをクリックし、「New repository」を選択します
3. リポジトリ名（例：`prompt-presentation`）を入力します
4. 「Create repository」をクリックします

### 1.2 コードのプッシュ

ローカル環境で以下のコマンドを実行します：

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/prompt-presentation.git

# vercel-deployディレクトリの内容をコピー
cp -r /path/to/vercel-deploy/* prompt-presentation/

# リポジトリに移動
cd prompt-presentation

# 変更をコミット
git add .
git commit -m "Initial commit"

# GitHubにプッシュ
git push origin main
```

## 2. Vercelアカウントの設定

1. [Vercel](https://vercel.com/)にアクセスします
2. GitHubアカウントでサインアップまたはログインします
3. 「Continue with GitHub」を選択し、認証を完了します

## 3. Vercelプロジェクトの作成

1. Vercelダッシュボードで「Add New...」→「Project」をクリックします
2. 「Import Git Repository」セクションから先ほど作成したGitHubリポジトリを選択します
3. プロジェクト設定を構成します：
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (デフォルト)
   - **Build Command**: `next build` (デフォルト)
   - **Output Directory**: `build` (next.config.jsで設定済み)

## 4. 環境変数の設定

1. プロジェクト設定画面の「Environment Variables」セクションで以下の変数を追加します：

   | 名前 | 値 | 環境 |
   |------|------|------|
   | `OPENAI_API_KEY` | あなたのOpenAI APIキー | Production, Preview, Development |
   | `GEMINI_API_KEY` | あなたのGemini APIキー | Production, Preview, Development |
   | `NEXT_PUBLIC_API_BASE_URL` | `/api` | Production, Preview, Development |

2. 「Save」をクリックして環境変数を保存します

## 5. デプロイの実行

1. 「Deploy」ボタンをクリックしてデプロイを開始します
2. デプロイが完了するまで待ちます（通常1〜2分）
3. デプロイが成功すると、プロジェクトURLが提供されます（例：`https://prompt-presentation.vercel.app`）

## 6. カスタムドメインの設定（オプション）

1. プロジェクト設定の「Domains」セクションに移動します
2. 「Add」をクリックして、所有しているドメインを追加します
3. 画面の指示に従ってDNS設定を行います

## 7. デプロイ後の確認

1. 提供されたURLにアクセスして、アプリケーションが正常に動作することを確認します
2. APIキー設定機能を使用して、OpenAIまたはGemini APIキーを設定します
3. プロンプトを入力して資料生成機能をテストします
4. テーマドロップダウンから「モノクローム（白黒）」を選択して、モノクロームテーマが正しく適用されることを確認します

## 8. 継続的デプロイ

GitHubリポジトリに変更をプッシュするたびに、Vercelは自動的に新しいデプロイを作成します。以下の手順で変更をデプロイできます：

```bash
git add .
git commit -m "変更内容の説明"
git push origin main
```

## 9. トラブルシューティング

### 9.1 デプロイエラー

デプロイに失敗した場合：
1. Vercelダッシュボードの「Deployments」タブでエラーログを確認します
2. TypeScriptエラーがある場合は、`.ts`または`.tsx`ファイルの型定義を修正します
3. 依存関係の問題がある場合は、`package.json`を確認して必要なパッケージが含まれていることを確認します

### 9.2 API接続エラー

APIが機能しない場合：
1. 環境変数が正しく設定されていることを確認します
2. ブラウザの開発者ツールでネットワークリクエストを確認します
3. サーバーログでエラーメッセージを確認します

### 9.3 APIキーの管理

セキュリティのため：
1. APIキーはVercelの環境変数としてのみ保存し、コードにハードコーディングしないでください
2. 本番環境では、APIキーの使用量を監視し、必要に応じて制限を設定してください

## 10. 注意点

- Vercelの無料プランには一定の制限があります（実行時間、帯域幅など）
- APIキーは環境変数として安全に保存されますが、フロントエンドコードでは直接参照できません
- サーバーレス関数の実行時間には制限があるため、長時間実行される処理は避けてください
