---
name: view-codex
description: Codex の設定・スキル一覧・環境を確認するときに使う。ユーザーが「Codexを見る」「Codexのスキル一覧」「CODEX_HOME の中身」などと言ったとき、または他プロジェクトから Codex 用スキルを持ってきたいときに参照する。
---

# Codex を見るスキル

ユーザーが Codex の状態を確認したいとき、または他プロジェクトから Codex 用スキルを取り込みたいときにこの手順に従う。

## いつ使うか

- 「Codex を見る」「Codex のスキル一覧が知りたい」
- 「CODEX_HOME の中身を確認したい」
- 「他のプロジェクトから Codex 用スキルを持ってきたい」
- Codex のスキルインストール・一覧のやり方を説明するとき

## Codex の場所と構造

- **Codex ホーム**: 環境変数 `CODEX_HOME`（未設定時は `~/.codex`）
- **スキル格納**: `$CODEX_HOME/skills/` または `~/.codex/skills/`
- **システムスキル**: `~/.codex/skills/.system/`（skill-installer, skill-creator 等はここにあり、事前インストール済み）

## 確認手順

1. **スキル一覧を見る**
   - `$CODEX_HOME/skills` 配下のディレクトリを列挙する（各フォルダに `SKILL.md` がある）
   - または `~/.codex/skills/.system/skill-installer/scripts/list-skills.py` を実行してインストール可能な curated 一覧を表示

2. **他プロジェクトからスキルを持ってくる**
   - **Codex 用**: 他プロジェクトの `.codex/skills/<スキル名>/` または `~/.codex/skills/<スキル名>/` を、この環境の `~/.codex/skills/<スキル名>/` にコピーする
   - **Cursor 用**: 他プロジェクトの `.cursor/skills/<スキル名>/` を、このプロジェクトの `.cursor/skills/` または `~/.cursor/skills/` にコピーする
   - スキルは「フォルダ + その中の SKILL.md」が1単位

3. **Codex にスキルをインストールする（公式リストから）**
   - `~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py` を使う
   - 例: `python3 scripts/install-skill-from-github.py --repo openai/skills --path skills/.curated/<スキル名>`
   - インストール後は「Restart Codex to pick up new skills」と伝える

## 注意

- Codex のスキルは **Codex 用**（`~/.codex/skills`）、Cursor のスキルは **Cursor 用**（`~/.cursor/skills` または `.cursor/skills`）で別体系
- 「他のプロジェクトからもってくる」場合は、コピー元のフルパスをユーザーに聞くか、同じマシン内のパスを指定してもらう
