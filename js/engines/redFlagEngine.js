import { loadProtocolJson, loadProtocolAnswers } from '../storage.js';

function shouldTriggerFlag(question, answer) {
    if (answer === undefined || answer === null || answer === '') {
        return false;
    }

    if (question.type === 'yesno') {
        return answer === true;
    }

    if (question.type === 'select') {
        const normalized = String(answer).trim();
        return normalized !== '' && normalized !== 'なし';
    }

    return String(answer).trim() !== '';
}

export async function detectRedFlags(protocolKey) {
    const protocol = await loadProtocolJson(protocolKey);
    if (!protocol || !Array.isArray(protocol.questions)) {
        return [];
    }

    const saved = loadProtocolAnswers();
    if (!saved || !saved.answers) {
        return [];
    }

    const flags = new Set();

    protocol.questions.forEach(question => {
        if (!question.flags || !Array.isArray(question.flags)) {
            return;
        }

        const answer = saved.answers[question.id];
        if (!shouldTriggerFlag(question, answer)) {
            return;
        }

        question.flags.forEach(flag => flags.add(flag));
    });

    return Array.from(flags);
}
