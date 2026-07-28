// router.js: シンプルなルーティングと初期化（ES Modules）
// ページ読み込み時に共通初期化関数を呼び出す

import { initApp } from './app.js';

// 初期化エントリポイント
document.addEventListener('DOMContentLoaded', () => {
    // アプリ全体の初期化
    initApp();

    // ルーティングの簡易処理（現在はページ遷移を補助するだけ）
    // 将来的にSPA化する場合はここで履歴管理を実装する
    // PWA: service worker の登録（存在する場合）
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            // 登録成功（日本語コメント）
            console.log('ServiceWorker 登録成功:', reg.scope);
        }).catch(err => {
            console.warn('ServiceWorker 登録失敗:', err);
        });
    }
});
