// app.js: アプリケーションの初期化処理（ES Module）
// このファイルは `initApp()` をエクスポートします。

// ページ固有のイベント登録や共通ハンドラをまとめる
export function initApp() {
    // ホーム画面のカードボタン（data-target属性で遷移先を指定）
    document.querySelectorAll('.card[data-target]').forEach(button => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-target');
            if (target) {
                window.location.href = target;
            }
        });
    });

    // 汎用: 次へボタンがある場合の挙動（フォーム側で制御されることを期待）
    const nextButton = document.querySelector('.next-btn');
    if (nextButton) {
        nextButton.addEventListener('click', (e) => {
            if (!e.defaultPrevented) {
                window.location.href = 'pages/symptoms.html';
            }
        });
    }

    // 症状選択ボタン（data-type属性を利用）
    document.querySelectorAll('.symptom').forEach(button => {
        button.addEventListener('click', () => {
            const symptom = button.dataset.type;
            localStorage.setItem('symptom', symptom);
            alert('選択：' + button.innerText);
        });
    });
}

// デフォルトで初期化はrouter.jsに委譲する