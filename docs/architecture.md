# システム設計書

# FireEMSAssistantPro

Version 1.0

---

## システム概要

消防指令課向けのWebアプリケーション。

119番通報時の聴取支援を目的とする。

判定支援を行うが、最終判断は指令員が行う。

---

## 基本構造

UI

↓

Router

↓

Store

↓

Protocol Engine

↓

Red Flag Engine

↓

Urgency Engine

↓

Summary Engine

↓

Storage

---

## 各モジュール

### Router

画面遷移のみ担当

---

### Store

入力データ管理

---

### Protocol Engine

質問の生成

回答の管理

次の質問の決定

---

### Red Flag Engine

危険徴候検出

---

### Urgency Engine

緊急度判定

---

### Summary Engine

申し送り文章生成

---

### Storage

LocalStorage

履歴保存

設定保存

---

## 設計原則

画面には判定を書かない

Engineへ処理を集約する

JSONから画面生成する