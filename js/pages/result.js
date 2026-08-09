import { detectRedFlags } from '../engines/redFlagEngine.js';
import { evaluateUrgency } from '../engines/urgencyEngine.js';
import { buildSummary } from '../engines/summaryEngine.js';
import { loadProtocolAnswers, loadProtocolJson } from '../storage.js';

const protocolNameElement = document.getElementById('protocolName');
const urgencySection = document.getElementById('urgencySection');
const urgencyLevel = document.getElementById('urgencyLevel');
const urgencyLabel = document.getElementById('urgencyLabel');
const urgencyStars = document.getElementById('urgencyStars');
const urgencyReasons = document.getElementById('urgencyReasons');
const redFlagList = document.getElementById('redFlagList');
const noFlagsMessage = document.getElementById('noFlagsMessage');
const summaryText = document.getElementById('summaryText');
const copySummaryBtn = document.getElementById('copySummaryBtn');
const copyMessage = document.getElementById('copyMessage');
const dispatchTimeElement = document.getElementById('dispatchTime');
const recommendedAction = document.getElementById('recommendedAction');

let copyMessageTimeout = null;

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

async function shareResult() {

    const protocol =
        protocolNameElement?.textContent.trim() || '症状';

    const level =
        urgencyLevel?.textContent.trim() || '';

    const label =
        urgencyLabel?.textContent.trim() || '';

    const stars =
        urgencyStars?.textContent.trim() || '';

    const action =
        recommendedAction?.textContent.trim() || '';

    const reasons = [...document.querySelectorAll('#urgencyReasons li')]
        .map(item => item.textContent.trim())
        .filter(Boolean);

    const redFlags = [...document.querySelectorAll('#redFlagList .red-flag-tag')]
        .map(item => {
            const text = item.querySelector('span:last-child');
            return text ? text.textContent.trim() : '';
        })
        .filter(Boolean);

    let summary =
    summaryText?.textContent.trim() || '';

summary = summary.replace(
    /\n?【緊急度】\n?緊急度は.*?です。\s*$/s,
    ''
).trim();

    let text = '';

    text += `🚑 消防救急アシスタント Pro\n`;
    text += `【判定結果】\n\n`;

    text += `■ 緊急度\n`;
    text += `${stars}\n`;
    text += `${level}　${label}\n`;
    text += `${action}\n\n`;

    if (reasons.length > 0) {
        text += `■ 判定理由\n`;
        reasons.forEach(reason => {
            text += `・${reason}\n`;
        });
        text += `\n`;
    }

    text += `■ レッドフラッグ\n`;

    if (redFlags.length > 0) {
        redFlags.forEach(flag => {
            text += `🚩 ${flag}\n`;
        });
    } else {
        text += `なし\n`;
    }

    text += `\n`;

    text += `■ 申し送り\n`;
    text += `${summary}\n`;

    if (navigator.share) {

        try {

            await navigator.share({
                title: '判定結果',
                text: text
            });

        } catch (error) {

            if (error.name !== 'AbortError') {
                console.error('共有エラー:', error);
            }

        }

    } else {

        alert('この端末では共有機能を利用できません。');

    }
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

    const flags = await detectRedFlags(protocolKey);
    renderRedFlags(flags);

    const urgency = await evaluateUrgency(protocolKey, saved?.answers || {}, flags);
    renderUrgency(urgency);

    const summary = buildSummary(protocolKey, saved?.answers || {}, flags, urgency);
    renderSummary(summary);

}


function initialize() {
    renderResult();
    updateDispatchTime();

    const shareBtn = document.getElementById('shareBtn');

if (shareBtn) {
    shareBtn.addEventListener('click', shareResult);
}

    const pdfBtn = document.getElementById("pdfBtn");

if (pdfBtn) {
    pdfBtn.addEventListener("click", exportPdf);
}

    const answerPageBtn = document.getElementById('answerPageBtn');

    if (answerPageBtn) {

        answerPageBtn.addEventListener('click', () => {

            location.href = "answers.html";

        });
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

function exportPdf() {

    const protocol =
        document.getElementById("protocolName")?.textContent.trim()
        || "症例";

    const urgency =
        document.getElementById("urgencyLevel")?.textContent.trim()
        || "LEVEL";

    const now = new Date();

    const yyyy = now.getFullYear();

    const mm = String(now.getMonth() + 1).padStart(2, "0");

    const dd = String(now.getDate()).padStart(2, "0");

    const hh = String(now.getHours()).padStart(2, "0");

    const min = String(now.getMinutes()).padStart(2, "0");

    const fileName =
        `${protocol}_${urgency}_${yyyy}-${mm}-${dd}_${hh}-${min}.pdf`;

    html2pdf()
        .set({

            filename: fileName,

            margin: 10,

            image: {

                type: "jpeg",

                quality: 1

            },

            html2canvas: {

                scale: 2

            },

            jsPDF: {

                unit: "mm",

                format: "a4",

                orientation: "portrait"

            }

        })

        .from(document.querySelector(".result-page"))

        .save();

}
    document.addEventListener('DOMContentLoaded', initialize);

    