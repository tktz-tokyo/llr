# CHANGELOG

リリースごとの変更サマリー。詳細な仕様は `docs/specs/` 配下の各仕様書を参照。

---

## 0.2.1 (2026-05-28)

### Bugfix

#### `every X days from completion`（`5日後` 等）の rollover 既定が誤っていた

0.2.0 マージ時に trial 由来のバグ入りテストを通すために `defaultRollover` を誤変更し、`from completion` の rollover 既定が `true` → `false` になっていた。結果として未完了ルーチンが数日間 Daily Note に出なくなる症状が発生。正しい挙動（完了するまで毎日表示）に戻した。

正しい設計: completion-anchored = rollover true（sticky）、due-anchored = rollover false（scheduled）。詳細は [[設計思想]] §8 を参照。

### マイグレーション
変更不要。`5日後` 系に `rollover: false` を明示していた場合のみ挙動が変わる。

---

## 0.2.0 (2026-05-22)

0.1.x 系を trial で育てた挙動・新機能をまとめて main に取り込んだリリース。

### 主な変更

- `repeat` 未設定 + `next_due` なしのノートも `Insert Routine` の今日候補として毎日表示
- 一回限り (one-off) due routine をサポート
- `tc/` ディレクトリ廃止
- v2 task grammar 整理と STATUS_PATTERN 正規表現修正
- 未来日付デイリーノートへの操作ガード強化（[[未来日付デイリーノートとルーチン基準日ポリシー]]）
- `@done` / `→done` プロトコルと routine-atdone-marker 整備（[[start_before-@done仕様]]）
- routine-reschedule-marker の `@MMDD` / `@M/D` 等の解釈と `→YYYY-MM-DD` 正規化（[[routine-reschedule-marker仕様]]）
- iOS でデバッグ Notice がチェックボックスのクリックを吸収する問題を defer 化で解消
- ESLint 導入・GitHub Actions による自動リリース（attestation 付き）

### 挙動差（既存ユーザが踏みうる）

- `repeat` 未指定 + `next_due` なしのノートが新たに毎日表示候補になる。出したくないノートは `repeat: none` を明示するか `routine/` 配下から外す。
- v2 task grammar 周りの再パース。古い書式のタスク行が再パース時に解釈が変わる可能性。
- 明日以降の daily note に対するルーチン挿入・タスク mutation がガードされる。

---

## 0.1.9 以前

詳細は `git log` または GitHub の commit history を参照。
