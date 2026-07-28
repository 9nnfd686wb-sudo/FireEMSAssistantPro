# AGENTS.md

# 消防救急アシスタント Pro

> AI開発ガイドライン
> Version 1.0

---

# 1. プロジェクト概要

## プロジェクト名

消防救急アシスタント Pro

## 目的

消防指令課で実際に利用できるWebアプリケーションを開発する。

このアプリは119番通報時の聴取を支援し、緊急度・重症度判定を補助する。

対象は消防職員であり、一般利用を目的としない。

---

## Version1で実装する機能

・119受付

・患者情報入力

・症状選択

・60秒聴取プロトコル

・レッドフラッグ表示

・緊急度判定

・指令票生成

・履歴管理

・PWA対応

---

# 2. 開発目標

本プロジェクトでは以下を重視する。

・操作速度

・視認性

・保守性

・拡張性

・オフライン利用

・消防現場での実用性

---

優先順位

1. 正確性

2. 安定性

3. 操作性

4. デザイン

---

# 3. システム構成

画面(UI)

↓

Router

↓

Store

↓

ProtocolEngine

↓

RedFlagEngine

↓

UrgencyEngine

↓

SummaryEngine

↓

Storage

画面は入力のみ担当する。

判定ロジックを画面へ記述しない。

---

# 4. ディレクトリ構成

FireEMSAssistantPro/

├── index.html

├── manifest.json

├── service-worker.js

├── AGENTS.md

├── README.md

├── CONTRIBUTING.md

│

├── assets/

├── icons/

├── css/

│ ├── variables.css

│ ├── layout.css

│ ├── components.css

│ └── style.css

│

├── js/

│ ├── app.js

│ ├── router.js

│ ├── store.js

│ ├── protocolEngine.js

│ ├── redFlagEngine.js

│ ├── urgencyEngine.js

│ ├── summaryEngine.js

│ └── storage.js

│

├── pages/

│ ├── home.html

│ ├── dispatch.html

│ ├── symptom.html

│ ├── protocol.html

│ ├── result.html

│ ├── history.html

│ └── settings.html

│

└── protocols/

├── common.json

├── chestPain.json

├── dyspnea.json

├── stroke.json

├── trauma.json

├── seizure.json

├── pediatric.json

└── heatStroke.json