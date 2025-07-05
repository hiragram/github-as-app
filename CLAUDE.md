# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

GitHub App MCP Server - GitHub App として認証を行い、Issue、Pull Request、リポジトリ操作を提供する Model Context Protocol (MCP) サーバー

## 開発コマンド

```bash
# TypeScriptのビルド
npm run build

# 開発モード（ファイル変更の自動監視）
npm run dev

# 本番実行
npm start

# npmパッケージとして公開する前の準備
npm run prepublishOnly
```

## アーキテクチャ

### コア構造
- `src/index.ts` - MCPサーバーのメインエントリーポイント。StdioServerTransportを使用してツールハンドラーを登録
- `src/github-client.ts` - GitHub App認証とOctokitクライアントのシングルトン管理
- `src/tools/` - MCPツールの実装を含むディレクトリ
  - `issues.ts` - Issue関連の6つのツール（list, get, create, update, comment, assign）
  - `pull-requests.ts` - PR関連の10つのツール（list, get, create, update, comment, merge, assign, request_reviewers, create_review_comment, submit_review, get_pr_checks, get_pr_status）
  - `repository.ts` - リポジトリ操作ツール（create_commit）

### 認証フロー
1. 環境変数から認証情報を取得（GITHUB_APP_ID、GITHUB_APP_PRIVATE_KEY、GITHUB_APP_INSTALLATION_ID）
2. Base64エンコードされた秘密鍵を自動的にデコード
3. Octokitインスタンスをキャッシュして再利用

### ログ出力
すべての操作は `/tmp/github-as-app.log` にログ出力される

## 技術スタック
- TypeScript (ES modules)
- @modelcontextprotocol/sdk - MCPサーバー実装
- @octokit/app - GitHub App認証
- @octokit/rest - GitHub API操作

## 重要な注意事項
- Octokit v15との互換性のため、`request`メソッドのラッパーが実装されている（src/github-client.ts:85-104）
- ツール名のルーティングロジックは`src/index.ts:73-85`で実装
- エラーハンドリングは各ツールハンドラー内で行われ、MCPエラーとして返される

## コミット規約
このプロジェクトでは **Conventional Commits** 規約に従ってコミットメッセージを作成する。

形式: `<type>(<scope>): <subject>`

主なタイプ:
- `feat`: 新機能の追加
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響を与えない変更（空白、フォーマット等）
- `refactor`: バグ修正や機能追加を伴わないコード変更
- `test`: テストの追加や修正
- `chore`: ビルドプロセスやツールの変更

例:
- `feat(issues): Add label filtering to list_issues tool`
- `fix(auth): Handle base64 encoded private keys correctly`
- `docs: Update README with installation instructions`