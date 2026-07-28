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

function normalizeFlag(flag) {
    if (!flag) {
        return null;
    }
    if (typeof flag === 'string') {
        return {
            id: flag.toLowerCase().replace(/\s+/g, '_'),
            label: flag,
            severity: 'low'
        };
    }
    if (typeof flag === 'object' && flag.id && flag.label) {
        return {
            id: flag.id,
            label: flag.label,
            severity: ['critical', 'high', 'medium', 'low'].includes(flag.severity) ? flag.severity : 'low'
        };
    }
    return null;
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

    const flagMap = new Map();

    protocol.questions.forEach(question => {
        if (!question.flags || !Array.isArray(question.flags)) {
            return;
        }

        const answer = saved.answers[question.id];
        if (!shouldTriggerFlag(question, answer)) {
            return;
        }

        question.flags.forEach(flag => {
            const normalized = normalizeFlag(flag);
            if (!normalized) {
                return;
            }
            if (!flagMap.has(normalized.id)) {
                flagMap.set(normalized.id, normalized);
            }
        });
    });

    return Array.from(flagMap.values());
}
