# Checklist Engine Spec

## 目的

Result画面に聴取チェックを追加し、聴取漏れを一目で把握できるようにする。

## 入力

- protocolId: string
- answers: object

## 出力

- completed: array of string
- missing: array of string
- completionRate: number

## CSV / JSON 定義

### protocols/checklists/chestPain.json

```json
{
  "required": [
    { "id": "location", "label": "場所" },
    { "id": "age", "label": "年齢" },
    { "id": "sex", "label": "性別" },
    { "id": "consciousnessImpairment", "label": "意識" },
    { "id": "breathingStatus", "label": "呼吸" },
    { "id": "onsetTime", "label": "発症時刻" },
    { "id": "chestPainOnset", "label": "突然発症" },
    { "id": "chestPainLocation", "label": "胸痛部位" },
    { "id": "radiation", "label": "放散痛" },
    { "id": "coldSweat", "label": "冷汗" },
    { "id": "breathingDifficulty", "label": "呼吸困難" },
    { "id": "chestPainSeverity", "label": "疼痛" },
    { "id": "medicalHistory", "label": "既往歴" },
    { "id": "medications", "label": "内服" }
  ]
}
```

## 処理

1. `protocolId` に応じたチェックリスト JSON を読み込む
2. `required` に定義された項目を走査
3. `answers` から各項目の回答を確認
4. 回答が存在すれば `completed` に追加、なければ `missing` に追加
5. 完了率を計算し、四捨五入して返却

## 例

```js
buildChecklist('chestPain', {
  location: '右胸部',
  age: 67,
  sex: '男性',
  consciousnessImpairment: false,
  breathingStatus: true,
  chestPainOnset: true,
  chestPainLocation: '左胸部',
  radiation: '左肩',
  chestPainSeverity: '8',
  medicalHistory: '心疾患',
  medications: 'アスピリン'
});
```

返却値:

```json
{
  "completed": ["場所","年齢","性別","意識","呼吸","突然発症","胸痛部位","放散痛","疼痛","既往歴","内服"],
  "missing": ["発症時刻","冷汗","呼吸困難"],
  "completionRate": 79
}
```
