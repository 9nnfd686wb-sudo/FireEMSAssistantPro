# データモデル設計

この設計書では、Protocol Engine / RedFlag Engine / Urgency Engine / Summary Engine で共通利用するデータモデルを定義します。

---

# dispatchData

119受付画面で収集する通報データです。

- `receptionId` : string
  - 受付ID（UUID などの一意識別子）
- `receptionTime` : string
  - 受付日時（ISO 8601 形式）
- `callerName` : string
  - 通報者氏名
- `patientName` : string
  - 患者氏名
- `phone` : string
  - 電話番号
- `address` : string
  - 発生場所
- `age` : number
  - 年齢
- `sex` : string
  - 性別（`男` / `女` / `不明`）
- `chiefComplaint` : string
  - 主訴
- `memo` : string
  - 自由メモ

### 例
```json
{
  "receptionId": "a1b2c3d4-e5f6-7890-ab12-cd34ef567890",
  "receptionTime": "2026-07-28T14:32:00",
  "callerName": "田中太郎",
  "patientName": "山田花子",
  "phone": "090-1234-5678",
  "address": "東京都新宿区西新宿2-8-1",
  "age": 45,
  "sex": "女",
  "chiefComplaint": "胸の痛み",
  "memo": "冷や汗と吐き気あり"
}
```

---

# protocolAnswers

Protocol Engine が生成した質問とその回答を保持します。

- `questionId` : string
  - 質問の一意識別子
- `questionText` : string
  - 質問文
- `answer` : string | number | boolean
  - 回答値
- `answeredAt` : string
  - 回答日時（ISO 8601 形式）

### 例
```json
[
  {
    "questionId": "consciousness",
    "questionText": "意識はありますか？",
    "answer": "はい",
    "answeredAt": "2026-07-28T14:35:10"
  },
  {
    "questionId": "breathing",
    "questionText": "呼吸はありますか？",
    "answer": "いいえ",
    "answeredAt": "2026-07-28T14:36:05"
  },
  {
    "questionId": "chestPainSeverity",
    "questionText": "痛みの強さ（0〜10）を入力してください",
    "answer": 8,
    "answeredAt": "2026-07-28T14:37:20"
  }
]
```

---

# redFlags

RedFlag Engine が検出した危険徴候の一覧です。

- `id` : string
  - 検出ID
- `name` : string
  - 表示名称
- `importance` : string
  - 重要度（例: `high` / `medium` / `low`）
- `reason` : string
  - 検出理由

### 例
```json
[
  {
    "id": "respiratory_arrest",
    "name": "呼吸停止",
    "importance": "high",
    "reason": "患者は呼吸がないと報告されました"
  },
  {
    "id": "chest_pain",
    "name": "胸痛",
    "importance": "medium",
    "reason": "胸痛と関連する症状が確認されました"
  }
]
```

---

# urgencyResult

Urgency Engine が算出する緊急度結果です。

- `level` : string
  - レベル（例: `最優先` / `緊急` / `準緊急` / `非緊急`）
- `priority` : string
  - 優先度（例: `high` / `medium` / `low`）
- `recommendedProtocol` : string
  - 推奨プロトコル ID または名称
- `reason` : string
  - 判定理由

### 例
```json
{
  "level": "最優先",
  "priority": "high",
  "recommendedProtocol": "chestPain",
  "reason": "呼吸状態と胸痛の組み合わせが重篤を示唆"
}
```

---

# summary

Summary Engine が生成する申し送りの結果です。

- `note` : string
  - 申し送り文章
- `answers` : protocolAnswers[]
  - 回答一覧
- `redFlags` : redFlags[]
  - レッドフラッグ一覧

### 例
```json
{
  "note": "胸痛、呼吸困難、冷や汗を伴うため、最優先で救急車を手配してください。",
  "answers": [
    {
      "questionId": "consciousness",
      "questionText": "意識はありますか？",
      "answer": "はい",
      "answeredAt": "2026-07-28T14:35:10"
    },
    {
      "questionId": "breathing",
      "questionText": "呼吸はありますか？",
      "answer": "いいえ",
      "answeredAt": "2026-07-28T14:36:05"
    }
  ],
  "redFlags": [
    {
      "id": "respiratory_arrest",
      "name": "呼吸停止",
      "importance": "high",
      "reason": "患者は呼吸がないと報告されました"
    }
  ]
}
```

---

# Version 1 / Version 2 追加予定項目

## Version 1

- `dispatchData` による基本受付データの保存
- `protocolAnswers` の質問回答保存と結果画面遷移
- `redFlags` の検出結果データフォーマット
- `urgencyResult` の緊急度結果フォーマット
- `summary` による申し送り文章と回答・レッドフラッグ一覧の統合

## Version 2

- `dispatchData` に `locationCoordinates` や `callerRelation` などの拡張項目
- `protocolAnswers` に `questionType` や `questionOptions` を含めた完全な質問メタデータ
- `redFlags` に `severityScore` / `category` / `recommendation` を追加
- `urgencyResult` に `dispatchAction` や `estimatedArrival` を追加
- `summary` に `urgencyResult` や `dispatchData` の要約を含めた詳細レポートを追加
