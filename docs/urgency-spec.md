# Urgency Engine 仕様

## 目的

消防指令課向けに、`protocolId`・`answers`・`redFlags` をもとに緊急度を判定する。

## 役割

- 判定エンジンは DOM 操作をしない
- 判定条件は `urgencyRules.json` のみで管理する
- Version1.0では胸痛プロトコルのみ対応する
- `answers` は入力仕様に含めるが、Version1.0では `redFlags` の判定にのみ使用する

## 入力

- `protocolId`: string
- `answers`: object
- `redFlags`: array

## 出力

```json
{
  "level": "LEVEL1",
  "priority": 1,
  "label": "最優先",
  "severity": "critical",
  "stars": 5,
  "color": "red",
  "reasons": [
    "突然発症",
    "意識障害"
  ]
}
```

## エンジン仕様

- `evaluateUrgency(protocolId, answers, redFlags)` を呼び出す
- `urgencyRules.json` を読み込み、該当するルールを判定する
- ルールは `protocol` が一致し、全ての `conditions` が `redFlags` に含まれる必要がある
- `conditions` が空のルールはデフォルトルールとして適用される
- ルールが一致しない場合は、`LEVEL4` のデフォルト結果を返す
- JSON 読み込みに失敗した場合もデフォルト結果を返す
- 戻り値は常にオブジェクト形式で返す

## JSON仕様

`protocols/urgencyRules.json` は配列形式のルール一覧。

例:

```json
[
  {
    "id": "level1_chestPain",
    "protocol": "chestPain",
    "conditions": [
      "sudden_onset",
      "consciousness_impairment"
    ],
    "level": "LEVEL1",
    "priority": 1,
    "severity": "critical",
    "label": "最優先",
    "stars": 5,
    "color": "red"
  }
]
```

### フィールド

- `id`: string
- `protocol`: string
- `conditions`: array of `redFlag` IDs
- `level`: string
- `priority`: number
- `severity`: string
- `label`: string
- `stars`: number
- `color`: string

## 色設定

- `LEVEL1`: red
- `LEVEL2`: orange
- `LEVEL3`: yellow
- `LEVEL4`: blue

## 画面表示

Result画面に表示する際の要件:

- `🚨 緊急度`
- `★★★★★` の星表示
- `LEVEL1`
- `最優先`
- 判定理由リスト

その下に表示:

- レッドフラッグ
- 申し送り（プレースホルダー）
- 回答一覧

## 今後の追加予定

- Summary Engine
- History
- Protocol 追加
- PWA
