// app.js
export function initApp() {

    // ホーム画面のカード
    document.querySelectorAll('.card[data-target]').forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.target;
            window.location.href = target;
        });
    });

    // 症状選択画面
    document.querySelectorAll('.symptom').forEach(button => {
        button.addEventListener('click', () => {

            const protocol = button.dataset.type;

            console.log(protocol);

            sessionStorage.setItem("protocol", protocol);

            window.location.href = "protocol.html";
        });
    });

}