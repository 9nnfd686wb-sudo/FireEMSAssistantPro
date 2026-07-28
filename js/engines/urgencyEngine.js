async function loadUrgencyRules() {
    try {
        const url = new URL('../../protocols/urgencyRules.json', import.meta.url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Urgency rules load failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

function conditionsMet(rule, redFlags) {
    if (!Array.isArray(rule.conditions)) {
        return false;
    }

    if (rule.conditions.length === 0) {
        return true;
    }

    if (!Array.isArray(redFlags) || redFlags.length === 0) {
        return false;
    }

    const flagIds = redFlags.map(flag => flag.id);
    return rule.conditions.every(condition => flagIds.includes(condition));
}

function findReasons(rule, redFlags) {
    if (!Array.isArray(rule.conditions) || !Array.isArray(redFlags)) {
        return [];
    }

    return rule.conditions
        .map(condition => {
            const flag = redFlags.find(item => item.id === condition);
            return flag?.label || condition;
        })
        .filter(Boolean);
}

function buildDefaultUrgency() {
    return {
        level: 'LEVEL4',
        priority: 4,
        label: '低',
        severity: 'low',
        stars: 2,
        color: 'blue',
        reasons: []
    };
}

export function evaluateUrgencyWithRules(protocolId, answers, redFlags, rules) {
    if (!Array.isArray(rules)) {
        return buildDefaultUrgency();
    }

    const matched = rules
        .filter(rule => rule.protocol === protocolId && conditionsMet(rule, redFlags))
        .sort((a, b) => (a.priority || 99) - (b.priority || 99));

    if (matched.length === 0) {
        return buildDefaultUrgency();
    }

    const primary = matched[0];

    return {
        level: primary.level,
        priority: primary.priority,
        label: primary.label,
        severity: primary.severity,
        stars: primary.stars,
        color: primary.color || 'blue',
        reasons: findReasons(primary, redFlags)
    };
}

export async function evaluateUrgency(protocolId, answers, redFlags) {
    const rules = await loadUrgencyRules();
    return evaluateUrgencyWithRules(protocolId, answers, redFlags, rules);
}
