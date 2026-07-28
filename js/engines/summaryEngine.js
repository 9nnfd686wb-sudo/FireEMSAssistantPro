function normalizeAge(age) {
    if (age === undefined || age === null || age === '') {
        return null;
    }

    const value = Number(age);
    if (!Number.isFinite(value) || value <= 0) {
        return null;
    }

    return Math.floor(value);
}

function normalizeSex(sex) {
    if (typeof sex !== 'string') {
        return null;
    }

    const trimmed = sex.trim();
    return trimmed === '' ? null : trimmed;
}

function getPatientInfo(dispatchData) {
    const age = normalizeAge(dispatchData?.age);
    const sex = normalizeSex(dispatchData?.sex) || '不明';

    return {
        age,
        sex
    };
}

function buildChiefComplaint(dispatchData) {
    const complaint = dispatchData?.chiefComplaint;
    if (typeof complaint === 'string' && complaint.trim() !== '') {
        return complaint.trim().replace(/。+$/, '');
    }

    return '胸痛';
}

function buildRedFlagText(redFlags) {
    if (!Array.isArray(redFlags) || redFlags.length === 0) {
        return '';
    }

    const labels = redFlags
        .filter(flag => flag && typeof flag.label === 'string' && flag.label.trim() !== '')
        .map(flag => flag.label.trim());

    if (labels.length === 0) {
        return '';
    }

    return `${labels.join('、')}を伴います。`;
}

function buildUrgencyText(urgency) {
    if (!urgency || typeof urgency.label !== 'string' || urgency.label.trim() === '') {
        return '';
    }

    return `${urgency.label.trim()}の緊急度です。`;
}

function buildPatientLabel(patient) {
    const ageText = patient.age !== null ? `${patient.age}歳` : '年齢不明';
    const sexText = patient.sex || null;

    if (patient.age !== null && sexText && sexText !== '不明') {
        return `${ageText}${sexText}。`;
    }

    if (patient.age === null && sexText && sexText !== '不明') {
        return `${ageText}。 ${sexText}。`;
    }

    return `${ageText}。`;
}

export function buildSummary(dispatchData, answers, redFlags, urgency) {
    const patient = getPatientInfo(dispatchData || {});
    const patientText = buildPatientLabel(patient);
    const complaint = buildChiefComplaint(dispatchData || {});
    const redFlagText = buildRedFlagText(redFlags);
    const urgencyText = buildUrgencyText(urgency);

    const handoverParts = [patientText, `${complaint}。`];
    if (redFlagText) {
        handoverParts.push(redFlagText);
    }
    if (urgencyText) {
        handoverParts.push(urgencyText);
    }

    return {
        handover: handoverParts.join(' '),
        patient: {
            age: patient.age,
            sex: patient.sex
        }
    };
}
