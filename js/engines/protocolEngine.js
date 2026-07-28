import { loadProtocolJson } from '../storage.js';
import { initAnswers, getAnswer, setAnswer, saveAnswers } from '../core/store.js';

const protocolSelect = document.getElementById('protocolSelect');
const loadProtocolBtn = document.getElementById('loadProtocolBtn');
const questionsSection = document.getElementById('questionsSection');
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
    const input = document.createElement('input');
    input.type = 'number';
    input.id = question.id;
    input.name = question.id;
    input.value = getAnswer(question.id) ?? '';
    if (typeof question.min === 'number') {
        input.min = question.min;
    }
    if (typeof question.max === 'number') {
        input.max = question.max;
    }
    input.placeholder = question.placeholder || '数値を入力してください';
    input.addEventListener('input', () => {
        setAnswer(question.id, input.value);
    });
    return input;
}

function renderSelect(question) {
    const select = document.createElement('select');
    select.id = question.id;
    select.name = question.id;

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '選択してください';
    select.appendChild(emptyOption);

    buildOptions(question.options).forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        optionElement.selected = getAnswer(question.id) === option.value;
        select.appendChild(optionElement);
    });

    select.addEventListener('change', () => {
        setAnswer(question.id, select.value);
    });
    return select;
}

function renderYesNo(question) {
    const optionGroup = document.createElement('div');
    optionGroup.className = 'option-group';
    const stored = normalizeYesNoAnswer(getAnswer(question.id));

    ['はい', 'いいえ'].forEach(labelText => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = question.id;
        input.value = labelText;
        const booleanValue = labelText === 'はい';
        input.checked = stored === booleanValue;
        input.addEventListener('change', () => {
            setAnswer(question.id, booleanValue);
        });

        label.appendChild(input);
        label.appendChild(document.createTextNode(labelText));
        optionGroup.appendChild(label);
    });

    return optionGroup;
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
    validationMessage.textContent = '';

    questionContainer.innerHTML = '';

    const label = document.createElement('label');
    label.textContent = question.label;
    questionContainer.appendChild(label);

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
    const selectedProtocol = protocolSelect.value;
    const protocol = await loadProtocolJson(selectedProtocol);
    if (!protocol) {
        return;
    }

    currentProtocol = protocol;
    currentQuestionIndex = 0;
    initAnswers(currentProtocol.protocolId || currentProtocol.id);

    questionsSection.hidden = false;
    renderQuestion();
}

function handleNavigation(direction) {
    if (!currentProtocol) {
        return;
    }

    const currentQuestion = currentProtocol.questions[currentQuestionIndex];
    updateCurrentAnswer(currentQuestion);

    if (!validateCurrentAnswer()) {
        return;
    }

    saveAnswers();

    const nextIndex = currentQuestionIndex + direction;
    if (nextIndex < 0) {
        return;
    }

    if (nextIndex >= currentProtocol.questions.length) {
        validationMessage.textContent = 'すべての質問に回答しました。';
        return;
    }

    goToQuestion(nextIndex);
}

loadProtocolBtn.addEventListener('click', loadProtocol);
prevBtn.addEventListener('click', () => handleNavigation(-1));
nextBtn.addEventListener('click', () => handleNavigation(1));
