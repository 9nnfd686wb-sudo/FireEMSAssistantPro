import { detectRedFlags } from '../engines/redFlagEngine.js';
import { loadProtocolAnswers } from '../storage.js';

const redFlagContainer = document.getElementById('redFlagList');
const noFlagsMessage = document.getElementById('noFlagsMessage');
const protocolNameElement = document.getElementById('protocolName');

async function renderResult() {
    const saved = loadProtocolAnswers();
    const protocolKey = saved && saved.protocolId ? saved.protocolId : 'common';
    protocolNameElement.textContent = `対象プロトコル: ${protocolKey}`;

    const flags = await detectRedFlags(protocolKey);
    if (!flags.length) {
        noFlagsMessage.hidden = false;
        redFlagContainer.innerHTML = '';
        return;
    }

    noFlagsMessage.hidden = true;
    redFlagContainer.innerHTML = flags.map(flag => `
        <li class="red-flag-item">
            <span class="red-flag-icon">⚠</span>
            <span>${flag}</span>
        </li>
    `).join('');
}

if (redFlagContainer && noFlagsMessage && protocolNameElement) {
    document.addEventListener('DOMContentLoaded', renderResult);
}
