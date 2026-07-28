import { loadProtocolAnswers, saveProtocolAnswers } from '../storage.js';

let answers = {};
let currentProtocolId = null;

export function initAnswers(protocolId) {
    currentProtocolId = protocolId;
    answers = {};

    const saved = loadProtocolAnswers();
    if (saved && saved.protocolId === currentProtocolId && typeof saved.answers === 'object' && saved.answers !== null) {
        answers = { ...saved.answers };
    }

    return getAllAnswers();
}

export function getAnswer(questionId) {
    return answers[questionId];
}

export function setAnswer(questionId, value) {
    answers[questionId] = value;
}

export function getAllAnswers() {
    return { ...answers };
}

export function saveAnswers() {
    if (!currentProtocolId) {
        return;
    }

    saveProtocolAnswers({
        protocolId: currentProtocolId,
        answers: getAllAnswers()
    });
}
