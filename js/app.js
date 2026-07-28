document.addEventListener("DOMContentLoaded", () => {

    // ホーム画面
    const dispatchButton = document.querySelector(".dispatch-button");

    if (dispatchButton) {

        dispatchButton.addEventListener("click", () => {

            window.location.href = "pages/dispatch.html";

        });

    }

    // 受付画面
    const nextButton = document.querySelector(".next-btn");

    if(nextButton){

        nextButton.addEventListener("click",()=>{

            window.location.href="symptoms.html";

        });

    }

    // 症状選択
    document.querySelectorAll(".symptom").forEach(button=>{

        button.addEventListener("click",()=>{

            const symptom=button.dataset.type;

            localStorage.setItem("symptom",symptom);

            alert("選択："+button.innerText);

            // 次回ここでプロトコル画面へ
            // window.location.href="protocol.html";

        });

    });

});