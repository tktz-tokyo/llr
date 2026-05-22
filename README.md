# LLR — Live Life Recording

[![Release](https://img.shields.io/github/v/release/goryugocast/llr?display_name=tag&sort=semver)](https://github.com/goryugocast/llr/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Obsidian](https://img.shields.io/badge/Obsidian-1.7.2%2B-7c3aed)](https://obsidian.md/)

> **日本語サイト:** https://goryugo.com/topics/llr
> **English site:** https://goryugo.com/en/llr/

An Obsidian plugin that records **task start times, finish times, and daily flow directly in Markdown**. One command — `Toggle Task` — covers create, start, and finish. No external database, no lock-in. Uninstall anytime; your records stay as plain text.

![Toggle Task demo](assets/llr-toggle-task.gif)

---

## Why LLR?

There are many task plugins for Obsidian. LLR is different in four specific ways:

- **Markdown is the only source of truth.** Start / finish times, estimates, actuals all live in the task line itself. No sidecar JSON, no separate DB. You can `grep` your history.
- **One verb, three actions.** `Toggle Task` creates, starts, and finishes — no separate commands to remember. Long-press / Adjust-Time fill in the rest.
- **Routines as plain notes.** `routine/` フォルダの 1 ノート = 1 ルーチン。`毎週月曜` / `every 3 days from completion` のような人間が読める記法で repeat を書く。完了で `next_due` が自動更新。
- **AI-friendly by design.** Full specification lives in [`docs/`](https://github.com/goryugocast/llr/tree/main/docs) as ~20 Markdown files. Point any AI at the folder and it can answer "how do I…?" without you reading manuals.

**Spend your attention on recording, not on learning the tool.**

---

## Install

### Community Plugins (recommended)

1. Open **Settings → Community Plugins → Browse**
2. Search for **"LLR"** and install
3. Enable LLR

### BRAT (latest beta)

1. Install and enable the **BRAT** community plugin
2. In BRAT settings choose **Add Beta plugin** and enter `goryugocast/llr`
3. Enable LLR in community plugins

Requires Obsidian **1.7.2** or later.

---

## Quick Start

All you need to learn first is `Toggle Task`:

| Step | Action | Result |
|---|---|---|
| 1 | Run `Toggle Task` on an empty line | `- [ ] ` appears |
| 2 | Run `Toggle Task` again | `- [/] 09:00 - ` (start time inserted) |
| 3 | Run `Toggle Task` once more | `- [x] 09:00 - 09:28 (28m)` (elapsed time computed) |

That's it. The record is just a Markdown checkbox — edit timestamps by hand any time and LLR recalculates.

LLR avoids "fighting" normal editing. Auto-corrections only fire when **you** trigger them via commands or checkbox gestures, never on idle text changes.

See [`docs/チートシート.md`](https://github.com/goryugocast/llr/blob/main/docs/%E3%83%81%E3%83%BC%E3%83%88%E3%82%B7%E3%83%BC%E3%83%88.md) for a quick cheatsheet (including a "**こんな時 → これ**" reverse lookup).

---

## Features

### Task line grammar

| State | Format |
|---|---|
| Unstarted | `- [ ] HH:mm Task name (estimate)` |
| Running | `- [/] HH:mm Task name HH:mm - (estimate)` |
| Done | `- [x] HH:mm Task name HH:mm - HH:mm (est > actual)` |

Estimate accepts `30`, `1.5h`, `45m`, `30 min` — written inline in parentheses or as a bare token at the end.

Inline markers (full reference: [`docs/specs/記録フォーマット.md`](https://github.com/goryugocast/llr/blob/main/docs/specs/%E8%A8%98%E9%8C%B2%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88.md)):

- `@done` — `start_before` を持つルーチンで「前倒し期間中にもう片付けた」を明示
- `@MMDD` / `@M/D` / `@2026-05-30` — そのルーチンを指定日へ先送り
- 処理済みは `→done` / `→YYYY-MM-DD` に正規化されて再発火しない

### Commands (13 total)

The 3 most-used:

| Command | What it does |
|---|---|
| `Toggle Task` | Create → Start → Finish (the main verb) |
| `Adjust Time (1m)` | 時刻 1 つ → 開始を -1分、2 つ → 終了を -1分。完了行は duration も再計算 |
| `Open Summary View` | サイドバーで今日の進捗を見る |

Auxiliary:

- `Start Task` / `Complete Task` / `Start Task (Align to Previous Completion)`
- `Reset Task (Keep Estimate)` / `Duplicate Task` / `Interrupt Task`
- `Skip Task (Log Only)` / `Retro Complete Task`
- `Reschedule Routine` / `Insert Routine`
- `Fix Duration Drift (All Completed Tasks)`

Full reference: [`docs/specs/コマンド仕様.md`](https://github.com/goryugocast/llr/blob/main/docs/specs/%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E4%BB%95%E6%A7%98.md)

---

## Routines

`routine/` 配下のノート (1 note = 1 routine) を frontmatter で定義し、`Insert Routine` でその日に出すべきものを自動展開します。

```yaml
---
estimate: 15            # 分
section: 700            # 7:00 台のセクション見出しに分類
repeat: 毎週月水金       # 日本語ショートハンド OK
next_due: 2026-05-25
start_before: 2         # 2 日前から前倒し表示
---
```

`repeat` で書ける記法（一部）:

- `1` / `3` — `every day` / `every 3 days`
- `毎週月曜` / `隔週月水金` — 週次
- `毎月1日` / `毎月5,10,15日` / `毎月末` — 月次
- `第2土曜日` / `最終土曜日` — 月次（第N曜日）
- `every 3 days from completion` / `every 5 days from due` — 起点を選ぶ
- `none` / `no` / `0` — 停止

完了したら `next_due` が自動更新されます。今日表示される条件の決定木は [`docs/specs/ルーチンエンジン仕様.md`](https://github.com/goryugocast/llr/blob/main/docs/specs/%E3%83%AB%E3%83%BC%E3%83%81%E3%83%B3%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%B3%E4%BB%95%E6%A7%98.md) §3.6 にフローチャートあり。

<!-- TODO: assets/llr-routine-insert.gif — Insert Routine の展開の様子 -->

---

## Summary View

Run `Open Summary View` for a daily overview in the sidebar.

<img src="assets/llr-summary-view.png" width="320" alt="Summary View">

- 完了 → 実行中 → 未完了 の積み上げ表示
- `EST. TOTAL` / `EST. FINISH` を動的計算
- `summary_role: sleep` のタスクは別計算（睡眠込みの目安時刻を併記）
- 行クリックで該当行ジャンプ、`[[wikilink]]` クリックでリンク先を開く
- `Routine Sections` 設定の時刻ラベルでセクション区切りを表示

Details: [`docs/specs/サイドバー要約ビュー仕様.md`](https://github.com/goryugocast/llr/blob/main/docs/specs/%E3%82%B5%E3%82%A4%E3%83%89%E3%83%90%E3%83%BC%E8%A6%81%E7%B4%84%E3%83%93%E3%83%A5%E3%83%BC%E4%BB%95%E6%A7%98.md)

---

## Mobile

Register `Toggle Task` in Obsidian's **Mobile Toolbar** (icon row above the keyboard).

- **Short press** チェックボックス — Toggle Task（作成 / 開始 / 完了）
- **Long press** チェックボックス（450ms） — 補助動作（直前完了の終了時刻に揃えて開始 / 1段戻して見積りは保持 など）
- 触覚フィードバック付き、長押し成立後のクリック吸収で二重発火を抑止
- 設定 `Large Mobile Checkboxes` でタップエリア拡大

<!-- TODO: assets/llr-mobile-longpress.gif — モバイル長押しジェスチャ -->

---

## Status Bar

`total` / `cursor` / `end` の 3 要素を表示:

- `total` — 今日のタスク見積りの合計
- `cursor` — カーソル位置以降の合計
- `end` — 現在時刻 + 残り見積り = 予定終了時刻

行末の時間表記のみ集計対象（本文中の数字は誤拾い回避）。

---

## Not a goal（あえてやらないこと）

LLR は **「Markdown に書いて記録する」体験を最小コストで深める** ためのプラグインです。以下は意図的にスコープ外:

- ⛔ タイマー / アラーム / 通知（OS や他プラグインに任せる）
- ⛔ カレンダー連携（範囲外）
- ⛔ 統計・グラフ・ダッシュボード（記録の正本は Markdown、解析は別ツール）
- ⛔ 専用の重量級ビュー（サイドバー Summary 以上は作らない）

「これってできる？」一覧は [`docs/specs/STATE_実装状況サマリー.md`](https://github.com/goryugocast/llr/blob/main/docs/specs/STATE_%E5%AE%9F%E8%A3%85%E7%8A%B6%E6%B3%81%E3%82%B5%E3%83%9E%E3%83%AA%E3%83%BC.md) §3 を参照。

---

## Documentation

| 用途 | リンク |
|---|---|
| 入口（全体地図） | [`docs/index.md`](https://github.com/goryugocast/llr/blob/main/docs/index.md) |
| クイックマニュアル | [`docs/クイックマニュアル.md`](https://github.com/goryugocast/llr/blob/main/docs/%E3%82%AF%E3%82%A4%E3%83%83%E3%82%AF%E3%83%9E%E3%83%8B%E3%83%A5%E3%82%A2%E3%83%AB.md) |
| チートシート（逆引き付き） | [`docs/チートシート.md`](https://github.com/goryugocast/llr/blob/main/docs/%E3%83%81%E3%83%BC%E3%83%88%E3%82%B7%E3%83%BC%E3%83%88.md) |
| 今回のバージョンについて | [`docs/specs/今回のバージョンについて.md`](https://github.com/goryugocast/llr/blob/main/docs/specs/%E4%BB%8A%E5%9B%9E%E3%81%AE%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6.md) |
| 設計思想 | [`docs/specs/設計思想.md`](https://github.com/goryugocast/llr/blob/main/docs/specs/%E8%A8%AD%E8%A8%88%E6%80%9D%E6%83%B3.md) |
| 公開サイト (JA) | https://goryugo.com/topics/llr |
| 公開サイト (EN) | https://goryugo.com/en/llr/ |

`docs/` 配下は **AI アシスタントに食わせる前提** で構造化されています。Cursor / Claude / ChatGPT のプロジェクト機能などに丸ごと投げてください。

---

## Development

```bash
npm install
npm run dev          # watch build
npm run build        # production bundle (main.js)
npm run build:sync   # bundle + sync to local Obsidian vault
npm run lint         # eslint
npm test             # vitest (watch)
npx vitest run       # vitest (one-shot)
```

Release は `git push origin <tag>`（タグ形式: `0.2.0`）で `.github/workflows/release.yml` が走り、build → attestation → GitHub Release 作成まで自動完了します。

## Issues / Feedback

- バグ報告・機能リクエスト: [GitHub Issues](https://github.com/goryugocast/llr/issues)
- Not a goal に該当する依頼は丁寧にお断りすることがあります（README 上記参照）

## License

[MIT](LICENSE)
