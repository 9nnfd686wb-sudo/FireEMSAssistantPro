import { detectRedFlags } from '../engines/redFlagEngine.js';
import { evaluateUrgency } from '../engines/urgencyEngine.js';
import { buildSummary } from '../engines/summaryEngine.js';
import { buildChecklist } from '../engines/checklistEngine.js';
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
const summaryText = document.getElementById('summaryText');
const copySummaryBtn = document.getElementById('copySummaryBtn');
const clearSummaryBtn = document.getElementById('clearSummaryBtn');
const copyMessage = document.getElementById('copyMessage');
const clearMessage = document.getElementById('clearMessage');
const checklistList = document.getElementById('checklistItems');
const checklistMissing = document.getElementById('checklistMissing');
const checklistCount = document.getElementById('checklistCount');
const nextChecklistItem = document.getElementById('nextChecklistItem');
const checklistRate = document.getElementById('checklistRate');
const checklistProgress = document.getElementById('checklistProgress');
const dispatchTimeElement = document.getElementById('dispatchTime');
const recommendedAction = document.getElementById('recommendedAction');

let copyMessageTimeout = null;

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

    const items = protocol.questions
        .map(question => {
            const answer = answers[question.id];
            const hasAnswer = answer !== undefined && answer !== null && answer !== '';
            if (!hasAnswer) {
                return null;
            }
            return {
                label: question.label || question.id,
                value: formatAnswer(question, answer)
            };
        })
        .filter(Boolean);

    if (items.length === 0) {
        answerEmptyText.hidden = false;
        return;
    }

    answerEmptyText.hidden = true;
    answerList.innerHTML = items
        .map(item => `
            <li class="qa-item">
                <span class="question-text">${item.label}</span>
                <span class="answer-text">${item.value}</span>
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
    const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    redFlagList.innerHTML = flags
        .slice()
        .sort((a, b) => {
            const aSeverity = a?.severity || 'low';
            const bSeverity = b?.severity || 'low';
            return (severityOrder[aSeverity] || 4) - (severityOrder[bSeverity] || 4);
        })
        .map(flag => {
            const label = typeof flag === 'string' ? flag : flag?.label || 'レッドフラッグ';
            const severity = typeof flag === 'object' ? flag.severity : 'low';
            return `
                <li class="red-flag-tag ${severity}">
                    <span class="red-flag-icon" aria-hidden="true">⚠</span>
                    <span>${label}</span>
                </li>
            `;
        })
        .join('');
}

function renderChecklist(checklist) {
    if (!checklist) {
        return;
    }

    if (checklistRate) {
        checklistRate.textContent = `${checklist.completionRate}%`;
    }

    if (checklistProgress) {
        checklistProgress.style.width = `${Math.max(0, Math.min(100, checklist.completionRate))}%`;
    }

    const total = checklist.completed.length + checklist.missing.length;
    if (checklistCount) {
        checklistCount.textContent = `${checklist.completed.length} / ${total} 確認済み`;
    }

    if (nextChecklistItem) {
        const nextLabel = checklist.missing.length > 0 ? checklist.missing[0] : 'すべて確認済みです';
        nextChecklistItem.textContent = `次に確認してください: ${nextLabel}`;
    }

    if (checklistList) {
        checklistList.innerHTML = checklist.completed
            .map(label => `
                <li class="checklist-item completed">
                    <span class="check-icon" aria-hidden="true">✔</span>
                    <span>${label}</span>
                </li>
            `)
            .join('');
    }

    if (checklistMissing) {
        checklistMissing.innerHTML = checklist.missing
            .map(label => `<li class="checklist-item missing">${label}</li>`)
            .join('');
    }
}

function renderUrgency(urgency) {
    if (!urgencySection) {
        return;
    }

    urgencySection.hidden = false;
    urgencySection.classList.remove('level1', 'level2', 'level3', 'level4');
    const levelClass = urgency && typeof urgency.level === 'string' ? urgency.level.toLowerCase() : 'level4';
    urgencySection.classList.add(levelClass);

    const stars = Number.isInteger(urgency?.stars) ? urgency.stars : 1;
    const filled = '★'.repeat(Math.max(0, Math.min(5, stars)));
    const empty = '☆'.repeat(5 - Math.max(0, Math.min(5, stars)));
    urgencyStars.textContent = `${filled}${empty}`;

    urgencyLevel.textContent = urgency?.level || 'LEVEL4';
    urgencyLabel.textContent = urgency?.label || '低';
    recommendedAction.textContent = getRecommendedAction(levelClass);

    urgencyReasons.innerHTML = urgency?.reasons?.length
        ? urgency.reasons.map(reason => `<li>${reason}</li>`).join('')
        : '<li>判定理由がありません</li>';
}

function getRecommendedAction(levelClass) {
    switch (levelClass) {
        case 'level1':
            return '🚑 直ちに出場';
        case 'level2':
            return '🚑 優先出場';
        case 'level3':
            return '🚑 標準出場';
        default:
            return '🚑 一般対応';
    }
}

function renderSummary(summary) {
    if (!summaryText) {
        return;
    }

    if (summary && typeof summary.summary === 'string' && summary.summary.trim() !== '') {
        summaryText.textContent = summary.summary;
    } else {
        summaryText.textContent = '申し送り情報がありません。';
    }
}

function showCopyMessage() {
    if (!copyMessage) {
        return;
    }

    copyMessage.hidden = false;
    if (copyMessageTimeout) {
        clearTimeout(copyMessageTimeout);
    }

    copyMessageTimeout = window.setTimeout(() => {
        copyMessage.hidden = true;
        copyMessageTimeout = null;
    }, 3000);
}

function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopyMessage();
}

function copySummary() {
    if (!summaryText) {
        return;
    }

    const text = summaryText.textContent.trim();
    if (!text) {
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(showCopyMessage)
            .catch(() => fallbackCopyText(text));
        return;
    }

    fallbackCopyText(text);
}

async function renderResult() {
    const saved = loadProtocolAnswers();
    const protocolKey = saved && saved.protocolId ? saved.protocolId : 'common';
    const protocol = await loadProtocolJson(protocolKey);

    const protocolName = protocol?.protocolName || protocolKey;
    protocolNameElement.textContent = protocolName;
    const symptomText = document.getElementById('dispatchSymptom');
    if (symptomText) {
        symptomText.textContent = protocolName;
    }

    renderAnswerItems(protocol, saved?.answers || {});

    const flags = await detectRedFlags(protocolKey);
    renderRedFlags(flags);

    const urgency = await evaluateUrgency(protocolKey, saved?.answers || {}, flags);
    renderUrgency(urgency);

    const summary = buildSummary(protocolKey, saved?.answers || {}, flags, urgency);
    renderSummary(summary);

    const checklist = await buildChecklist(protocolKey, saved?.answers || {});
    renderChecklist(checklist);
}

function clearSummary() {
    if (!summaryText) {
        return;
    }

    summaryText.textContent = '申し送り情報がクリアされました。';
    if (copyMessage) {
        copyMessage.hidden = true;
    }
    if (clearMessage) {
        clearMessage.hidden = false;
        window.setTimeout(() => {
            clearMessage.hidden = true;
        }, 3000);
    }
}

function initialize() {
    renderResult();
    updateDispatchTime();

    if (copySummaryBtn) {
        copySummaryBtn.addEventListener('click', copySummary);
    }
    if (clearSummaryBtn) {
        clearSummaryBtn.addEventListener('click', clearSummary);
    }
}

function updateDispatchTime() {
    if (!dispatchTimeElement) {
        return;
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    dispatchTimeElement.textContent = `${hours}:${minutes}`;
}
    document.addEventListener('DOMContentLoaded', initialize);
