function buildComplaint(protocolId) {
    if (protocolId === 'chestPain') {
        return '胸痛';
    }
    return '症状';
}

function normalizeString(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value).trim();
}

function buildRedFlagSentences(redFlags, complaint) {
    if (!Array.isArray(redFlags) || redFlags.length === 0) {
        return [];
    }

    const sentences = [];
    const labels = redFlags
        .filter(flag => flag && typeof flag.label === 'string' && flag.label.trim() !== '')
        .map(flag => ({ id: flag.id, label: flag.label.trim() }));

    labels.forEach(({ id, label }) => {
        if (id === 'sudden_onset') {
            if (complaint === '胸痛') {
                sentences.push('突然発症の胸痛です。');
                return;
            }
            sentences.push('突然発症があります。');
            return;
        }

        if (id === 'cold_sweat') {
            sentences.push('冷汗があります。');
            return;
        }

        if (id === 'breathing_difficulty') {
            sentences.push('呼吸困難があります。');
            return;
        }

        if (id === 'consciousness_impairment') {
            sentences.push('意識障害があります。');
            return;
        }

        if (id === 'radiation_pain') {
            return;
        }

        sentences.push(`${label}があります。`);
    });

    return sentences;
}

function buildRadiationSentence(answers) {
    const radiation = normalizeString(answers?.radiation);
    if (!radiation || radiation === 'なし') {
        return '';
    }
    return `${radiation}へ放散しています。`;
}

function buildLocationSentence(answers) {
    const location = normalizeString(answers?.chestPainLocation);
    if (!location) {
        return '';
    }
    return `胸痛部位は${location}です。`;
}

function buildPainSentence(answers) {
    const severity = answers?.chestPainSeverity;
    if (severity === undefined || severity === null || String(severity).trim() === '') {
        return '';
    }

    const value = String(severity).trim();
    return `疼痛は${value}です。`;
}

function buildHistorySentence(answers) {
    const history = normalizeString(answers?.medicalHistory);
    if (!history) {
        return '';
    }
    return `既往歴は${history}です。`;
}

function buildMedicationSentence(answers) {
    const meds = normalizeString(answers?.medications);
    if (!meds) {
        return '';
    }
    return `内服薬は${meds}です。`;
}

function buildUrgencySentence(urgency) {
    if (!urgency || typeof urgency.level !== 'string' || urgency.level.trim() === '') {
        return '';
    }

    const label = typeof urgency.label === 'string' && urgency.label.trim() !== ''
        ? urgency.label.trim()
        : '';

    if (label) {
        return `緊急度は${urgency.level.trim()}（${label}）です。`;
    }

    return `緊急度は${urgency.level.trim()}です。`;
}

export function buildSummary(protocolId, answers, redFlags, urgency) {
    const complaint = buildComplaint(protocolId);
    const normalizedAnswers = answers && typeof answers === 'object' ? answers : {};

    const sentences = [];
    const redFlagSentences = buildRedFlagSentences(redFlags, complaint);

    sentences.push(...redFlagSentences);

    const locationSentence = buildLocationSentence(normalizedAnswers);
    if (locationSentence) {
        sentences.push(locationSentence);
    }

    const radiationSentence = buildRadiationSentence(normalizedAnswers);
    if (radiationSentence) {
        sentences.push(radiationSentence);
    }

    const painSentence = buildPainSentence(normalizedAnswers);
    if (painSentence) {
        sentences.push(painSentence);
    }

    const historySentence = buildHistorySentence(normalizedAnswers);
    if (historySentence) {
        sentences.push(historySentence);
    }

    const medicationSentence = buildMedicationSentence(normalizedAnswers);
    if (medicationSentence) {
        sentences.push(medicationSentence);
    }

    const urgencySentence = buildUrgencySentence(urgency);
    if (urgencySentence) {
        sentences.push(urgencySentence);
    }

    const filtered = sentences.filter(sentence => typeof sentence === 'string' && sentence.trim() !== '');
    return {
        summary: filtered.join('\n')
    };
}
