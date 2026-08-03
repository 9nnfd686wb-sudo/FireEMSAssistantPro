import { loadProtocolJson } from '../storage.js';
import { initAnswers, getAnswer, setAnswer, saveAnswers } from '../core/store.js';

const questionText = document.getElementById('questionText');
const questionContainer = document.getElementById('questionContainer');
const progressText = document.getElementById('progressText');
const validationMessage = document.getElementById('validationMessage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentProtocol = null;
let currentQuestionIndex = 0;

function buildOptions(options) {
    if (!Array.isArray(options)) {
        return [];
    }
    return options.map(option => {
        if (typeof option === 'string') {
            return { label: option, value: option };
        }
        return option;
    });
}

function normalizeYesNoAnswer(answer) {
    if (answer === true || answer === false) {
        return answer;
    }
    if (answer === 'はい' || answer === 'true') {
        return true;
    }
    if (answer === 'いいえ' || answer === 'false') {
        return false;
    }
    return undefined;
}

function renderText(question) {
    const textarea = document.createElement('textarea');
    textarea.id = question.id;
    textarea.name = question.id;
    textarea.value = getAnswer(question.id) || '';
    textarea.placeholder = question.placeholder || '回答を入力してください';
    textarea.addEventListener('input', () => {
        setAnswer(question.id, textarea.value);
    });
    return textarea;
}

function renderNumber(question) {

    const group = document.createElement("div");
    group.className = "number-grid";

    for (let i = question.min; i <= question.max; i++) {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "number-card";

        button.textContent = i;

        if (Number(getAnswer(question.id)) === i) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {

    setAnswer(question.id, i);

    saveAnswers();

    group.querySelectorAll(".answer-card").forEach(card=>{
        card.classList.remove("selected");
    });

    button.classList.add("selected");

    setTimeout(() => {
        handleNavigation(1);
    },250);

});
        group.appendChild(button);
    }

    return group;
}

function renderSelect(question) {

    const group = document.createElement("div");
    group.className = "option-group";

    buildOptions(question.options).forEach(option => {

        const button = document.createElement("button");

        button.type = "button";

        button.className = "answer-card";

        button.textContent = option.label;

        if (getAnswer(question.id) === option.value) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {

    setAnswer(question.id, option.value);

    saveAnswers();

    button.classList.add("selected");

    handleNavigation(1);

        });

        group.appendChild(button);

    });

    return group;

}

function renderYesNo(question) {

    const group = document.createElement("div");
    group.className = "option-group";

    const stored = normalizeYesNoAnswer(getAnswer(question.id));

    [
        { text: "はい", value: true },
        { text: "いいえ", value: false }

    ].forEach(option => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "answer-card";

        button.textContent = option.text;

        if (stored === option.value) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {

            setAnswer(question.id, option.value);

            saveAnswers();

            group.querySelectorAll(".answer-card").forEach(card=>{
                card.classList.remove("selected");
            });

            button.classList.add("selected");

            setTimeout(() => {
                handleNavigation(1);
            },250);

        });

        group.appendChild(button);

    });

    return group;

}

function renderUnsupported() {
    const message = document.createElement('div');
    message.textContent = 'この質問タイプは未対応です。';
    return message;
}

const renderers = {
    text: renderText,
    number: renderNumber,
    select: renderSelect,
    yesno: renderYesNo
};

function renderQuestion() {
    if (!currentProtocol || !currentProtocol.questions) {
        return;
    }

    const question = currentProtocol.questions[currentQuestionIndex];
    if (!question) {
        return;
    }

    questionText.textContent = question.label || '質問';
    progressText.textContent = `質問 ${currentQuestionIndex + 1} / ${currentProtocol.questions.length}`;
    document.getElementById("protocolProgress").textContent =`質問 ${currentQuestionIndex + 1} / ${currentProtocol.questions.length}`;
    validationMessage.textContent = '';

    questionContainer.innerHTML = '';

const renderer = renderers[question.type] || renderUnsupported;
questionContainer.appendChild(renderer(question));
}

function readCurrentAnswer(question) {
    if (question.type === 'yesno') {
        const checked = document.querySelector(`[name="${question.id}"]:checked`);
        return checked ? checked.value === 'はい' : undefined;
    }

    const input = document.querySelector(`#${question.id}`);
    if (!input) {
        return undefined;
    }

    if (question.type === 'number') {
        return input.value;
    }

    return input.value;
}

function updateCurrentAnswer(question) {
    const answer = readCurrentAnswer(question);
    if (answer !== undefined) {
        if (question.type === 'yesno') {
            setAnswer(question.id, answer);
        } else {
            setAnswer(question.id, answer);
        }
    }
}

function validateCurrentAnswer() {
    const question = currentProtocol.questions[currentQuestionIndex];
    const answer = getAnswer(question.id);

    if (question.required) {
        const value = answer !== undefined && answer !== null ? String(answer).trim() : '';
        if (value === '') {
            validationMessage.textContent = 'この質問には回答が必要です。';
            return false;
        }
    }

    if (question.type === 'number' && answer !== undefined && answer !== null && String(answer).trim() !== '') {
        const numeric = Number(answer);
        if (Number.isNaN(numeric)) {
            validationMessage.textContent = '有効な数値を入力してください。';
            return false;
        }
        if (typeof question.min === 'number' && numeric < question.min) {
            validationMessage.textContent = `最低 ${question.min} 以上の値を入力してください。`;
            return false;
        }
        if (typeof question.max === 'number' && numeric > question.max) {
            validationMessage.textContent = `最大 ${question.max} までの値を入力してください。`;
            return false;
        }
    }

    validationMessage.textContent = '';
    return true;
}

function goToQuestion(index) {
    if (!currentProtocol) {
        return;
    }

    if (index < 0 || index >= currentProtocol.questions.length) {
        return;
    }

    currentQuestionIndex = index;
    renderQuestion();
}

async function loadProtocol() {

    const selectedProtocol = sessionStorage.getItem("protocol");

    if (!selectedProtocol) {
        alert("症状を選択してください");
        window.location.href = "symptoms.html";
        return;
    }

    const protocol = await loadProtocolJson(selectedProtocol);

    if (!protocol) {
        alert("プロトコルが見つかりません");
        return;
    }

    currentProtocol = protocol;
    document.getElementById("protocolTitle").textContent =
    currentProtocol.protocolName;
    currentQuestionIndex = 0;

    initAnswers(currentProtocol.protocolId || currentProtocol.id);

    // タイトル表示
    const title = document.getElementById("selectedSymptomName");
    if (title) {
        title.textContent = currentProtocol.protocolName;
    }

    renderQuestion();
}

function handleNavigation(direction) {
    if (!currentProtocol) {
        return;
    }

    const currentQuestion = currentProtocol.questions[currentQuestionIndex];

// updateCurrentAnswer(currentQuestion);

if (direction > 0 && !validateCurrentAnswer()) {
    return;
}

    saveAnswers();

    const nextIndex = currentQuestionIndex + direction;
    if (nextIndex < 0) {
        return;
    }

    if (nextIndex >= currentProtocol.questions.length) {
        saveAnswers();
        window.location.href = 'result.html';
        return;
    }

    goToQuestion(nextIndex);
}

loadProtocol();

if (prevBtn) {

    prevBtn.addEventListener("click", () => {

        handleNavigation(-1);

    });

}