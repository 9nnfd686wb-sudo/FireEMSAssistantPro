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

async function exportPdf() {

    const original = document.querySelector(".result-page");

    if (!original) {
        alert("PDF対象が見つかりません。");
        return;
    }

    // ==============================
    // 現在の判定結果を複製
    // ==============================

    const pdfTarget = original.cloneNode(true);

    pdfTarget.classList.add("pdf-export");

    // ==============================
    // PDFに不要な操作ボタンを削除
    // ==============================

    pdfTarget.querySelectorAll(
        ".note-actions, .bottom-actions, #copyMessage"
    ).forEach(element => {
        element.remove();
    });

    // ==============================
    // 申し送りから最後の緊急度行を削除
    // ==============================

    const summary = pdfTarget.querySelector("#summaryText");

    if (summary) {

        const lines = summary.innerText
            .split("\n")
            .filter(line => {
                return !line.trim().startsWith("緊急度は");
            });

        summary.textContent = lines.join("\n");
    }

    // ==============================
    // PDF専用CSS
    // ==============================

    const style = document.createElement("style");

    style.textContent = `

        /* =================================
           PDF全体
        ================================= */

        .pdf-export {

            width: 794px !important;

            min-height: 1123px !important;

            box-sizing: border-box !important;

            padding: 28px !important;

            margin: 0 !important;

            background: #ffffff !important;

            color: #172033 !important;

            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Helvetica Neue",
                "Yu Gothic",
                "Hiragino Kaku Gothic ProN",
                Arial,
                sans-serif !important;

            overflow: hidden !important;

        }


        /* =================================
           共通
        ================================= */

        .pdf-export section {

            margin-bottom: 14px !important;

        }

        .pdf-export .card {

            box-shadow: none !important;

        }


        /* =================================
           緊急度
        ================================= */

        .pdf-export .urgency-card {

            display: grid !important;

            grid-template-columns: 40% 60% !important;

            height: 220px !important;

            min-height: 220px !important;

            padding: 0 !important;

            border-radius: 14px !important;

            overflow: hidden !important;

        }

        .pdf-export .urgency-left {

            padding: 18px !important;

            gap: 8px !important;

        }

        .pdf-export .urgency-title {

            font-size: 24px !important;

        }

        .pdf-export .urgency-stars {

            font-size: 30px !important;

            letter-spacing: 2px !important;

        }

        .pdf-export .urgency-label {

            font-size: 38px !important;

            line-height: 1.1 !important;

        }

        .pdf-export .urgency-right {

            padding: 20px !important;

        }

        .pdf-export .urgency-header h3 {

            font-size: 22px !important;

        }

        .pdf-export .action-badge {

            font-size: 16px !important;

            padding: 7px 14px !important;

        }

        .pdf-export .urgency-reasons {

            font-size: 17px !important;

            line-height: 1.6 !important;

        }


        /* =================================
           申し送り
        ================================= */

        .pdf-export .note-card {

            height: auto !important;

            min-height: 0 !important;

            padding: 0 !important;

            border-radius: 14px !important;

            overflow: hidden !important;

            background: #ffffff !important;

            border: 2px solid #164b80 !important;

        }

        .pdf-export .note-header {

            display: block !important;

            padding: 10px 16px !important;

            background: #103c68 !important;

            color: #ffffff !important;

        }

        .pdf-export .note-header h2 {

            margin: 0 !important;

            font-size: 21px !important;

            color: #ffffff !important;

        }

        .pdf-export .summary-wrapper {

            height: auto !important;

            min-height: 0 !important;

            padding: 16px 20px !important;

            background: #ffffff !important;

            overflow: visible !important;

        }

        .pdf-export .summary-text {

            height: auto !important;

            min-height: 0 !important;

            max-height: none !important;

            overflow: visible !important;

            margin: 0 !important;

            padding: 0 !important;

            color: #172033 !important;

            background: transparent !important;

            font-size: 16px !important;

            font-weight: 600 !important;

            line-height: 1.5 !important;

            white-space: pre-wrap !important;

        }


        /* =================================
           プロトコル
        ================================= */

        .pdf-export .protocol-card {

            min-height: 55px !important;

            height: 55px !important;

            padding: 8px !important;

            border-radius: 12px !important;

            background: #5d9de0 !important;

        }

        .pdf-export #protocolName {

            font-size: 20px !important;

            color: #ffffff !important;

        }


        /* =================================
           レッドフラッグ
        ================================= */

        .pdf-export .redflag-card {

            min-height: 100px !important;

            height: auto !important;

            padding: 14px !important;

            border-radius: 14px !important;

        }

        .pdf-export .redflag-card .section-header {

            margin-bottom: 10px !important;

        }

        .pdf-export .redflag-card h2 {

            font-size: 21px !important;

        }

        .pdf-export .red-flag-list {

            display: flex !important;

            flex-wrap: wrap !important;

            gap: 8px !important;

        }

        .pdf-export .red-flag-tag {

            display: inline-flex !important;

            padding: 7px 12px !important;

            border-radius: 8px !important;

            font-size: 14px !important;

        }


        /* =================================
           PDFでは非表示
        ================================= */

        .pdf-export .answer-btn,
        .pdf-export .share-btn,
        .pdf-export .copy-btn,
        .pdf-export .bottom-actions,
        .pdf-export .note-actions {

            display: none !important;

        }

    `;

    // ==============================
    // 一時的に表示領域へ配置
    // ==============================

    pdfTarget.style.position = "fixed";
    pdfTarget.style.left = "0";
    pdfTarget.style.top = "0";
    pdfTarget.style.zIndex = "-9999";
    pdfTarget.style.opacity = "1";

    document.body.appendChild(style);
    document.body.appendChild(pdfTarget);

    // ==============================
    // PDFファイル名
    // ==============================

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
        `消防救急アシスタント_${protocol}_${urgency}_${yyyy}-${mm}-${dd}_${hh}-${min}.pdf`;

    // ==============================
    // PDF生成
    // ==============================

    try {

        await html2pdf()
            .set({

                margin: 0,

                filename: fileName,

                image: {
                    type: "jpeg",
                    quality: 0.98
                },

                html2canvas: {

                    scale: 1.5,

                    useCORS: true,

                    backgroundColor: "#ffffff",

                    logging: false

                },

                jsPDF: {

                    unit: "mm",

                    format: "a4",

                    orientation: "portrait"

                },

                pagebreak: {

                    mode: ["css", "legacy"]

                }

            })

            .from(pdfTarget)

            .save();

    } catch (error) {

        console.error("PDF生成エラー:", error);

        alert("PDFの生成に失敗しました。");

    } finally {

        // PDF生成後に削除

        pdfTarget.remove();
        style.remove();

    }

}
    document.addEventListener('DOMContentLoaded', initialize);
    