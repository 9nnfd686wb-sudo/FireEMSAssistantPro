import { detectRedFlags } from '../engines/redFlagEngine.js';
import { evaluateUrgency } from '../engines/urgencyEngine.js';
import { loadProtocolAnswers, loadProtocolJson } from '../storage.js';

const protocolNameElement = document.getElementById('protocolName');
const urgencySection = document.getElementById('urgencySection');
const urgencyLevel = document.getElementById('urgencyLevel');
const urgencyLabel = document.getElementById('urgencyLabel');
const urgencyStars = document.getElementById('urgencyStars');
const urgencyReasons = document.getElementById('urgencyReasons');
const answerList = document.getElementById('answerList');
const answerEmptyText = document.getElementById('answerEmptyText');
const redFlagList = document.getElementById('redFlagList');
const noFlagsMessage = document.getElementById('noFlagsMessage');
const summaryPlaceholder = document.getElementById('summaryPlaceholder');

function formatAnswer(question, answer) {
    if (question.type === 'yesno') {
        return answer === true ? 'はい' : 'いいえ';
    }
    if (question.type === 'number') {
        return answer !== undefined && answer !== null ? String(answer) : '未回答';
    }
    if (question.type === 'select') {
        return String(answer || '未回答');
    }
    if (question.type === 'text') {
        return String(answer || '未回答');
    }
    return String(answer || '未回答');
}

function renderAnswerItems(protocol, answers) {
    answerList.innerHTML = '';

    if (!protocol || !Array.isArray(protocol.questions) || !answers) {
        answerEmptyText.hidden = false;
        return;
    }

    const items = protocol.questions.map(question => {
        const answer = answers[question.id];
        return {
            label: question.label || question.id,
            value: answer !== undefined ? formatAnswer(question, answer) : '未回答'
        };
    });

    if (items.length === 0) {
        answerEmptyText.hidden = false;
        return;
    }

    answerEmptyText.hidden = true;
    answerList.innerHTML = items
        .map(item => `
            <li class="answer-item">
                <span class="answer-label">${item.label}</span>
                <span class="answer-value">${item.value}</span>
            </li>
        `)
        .join('');
}

function renderRedFlags(flags) {
    if (!flags || !flags.length) {
        noFlagsMessage.hidden = false;
        redFlagList.innerHTML = '';
        return;
    }

    noFlagsMessage.hidden = true;
    redFlagList.innerHTML = flags
        .map(flag => {
            const label = typeof flag === 'string' ? flag : flag?.label || 'レッドフラッグ';
            return `
                <li class="red-flag-item">
                    <span class="red-flag-icon" aria-hidden="true">⚠</span>
                    <span>${label}</span>
                </li>
            `;
        })
        .join('');
}

function renderUrgency(urgency) {
    if (!urgencySection) {
        return;
    }

    urgencySection.hidden = false;
    urgencySection.style.borderColor = urgency.color || 'blue';
    urgencyStars.textContent = '★★★★★'.slice(0, urgency.stars || 1);
    urgencyStars.style.color = urgency.color || 'blue';
    urgencyLevel.textContent = urgency.level;
    urgencyLevel.style.color = urgency.color || 'blue';
    urgencyLabel.textContent = urgency.label;

    urgencyReasons.innerHTML = urgency.reasons.length
        ? urgency.reasons.map(reason => `<li>${reason}</li>`).join('')
        : '<li>判定理由がありません</li>';
}

async function renderResult() {
    const saved = loadProtocolAnswers();
    const protocolKey = saved && saved.protocolId ? saved.protocolId : 'common';
    const protocol = await loadProtocolJson(protocolKey);

    protocolNameElement.textContent = protocol?.protocolName || protocolKey;
    renderAnswerItems(protocol, saved?.answers || {});

    const flags = await detectRedFlags(protocolKey);
    renderRedFlags(flags);

    const urgency = await evaluateUrgency(protocolKey, saved?.answers || {}, flags);
    renderUrgency(urgency);
}

if (protocolNameElement && answerList && answerEmptyText && redFlagList && noFlagsMessage) {
    document.addEventListener('DOMContentLoaded', renderResult);
}
