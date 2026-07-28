async function loadChecklistJson(protocolId) {
    try {
        const url = new URL(`../../protocols/checklists/${protocolId}.json`, import.meta.url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Checklist load failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

function normalizeAnswerValue(value) {
    if (value === undefined || value === null) {
        return null;
    }
    if (typeof value === 'string') {
        return value.trim() === '' ? null : value;
    }
    return value;
}

export async function buildChecklist(protocolId, answers) {
    const checklist = await loadChecklistJson(protocolId);
    if (!checklist || !Array.isArray(checklist.required)) {
        return {
            completed: [],
            missing: [],
            completionRate: 0
        };
    }

    const normalizedAnswers = answers && typeof answers === 'object' ? answers : {};
    const completed = [];
    const missing = [];

    checklist.required.forEach(item => {
        const id = item.id || item;
        const label = item.label || item;
        const value = normalizeAnswerValue(normalizedAnswers[id]);

        if (value === null) {
            missing.push(label);
        } else {
            completed.push(label);
        }
    });

    const total = checklist.required.length;
    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    return {
        completed,
        missing,
        completionRate
    };
}
