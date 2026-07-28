// storage.js: LocalStorage への保存処理を分離し、画面から呼び出す
// 判定ロジックはここには含めない

export function saveDispatchData(data) {
    const defaultPayload = {
        callerName: '',
        patientName: '',
        phone: '',
        address: '',
        callTime: '',
        age: '',
        sex: '',
        chiefComplaint: '',
        memo: ''
    };

    const payload = { ...defaultPayload, ...data };

    try {
        localStorage.setItem('dispatchData', JSON.stringify(payload));
    } catch (error) {
        console.error('LocalStorage 保存に失敗しました', error);
    }
}

export async function loadProtocolJson(protocolKey) {
    const protocolMap = {
        common: '../protocols/common.json',
        chestPain: '../protocols/chestPain.json'
    };

    const url = protocolMap[protocolKey] || protocolMap.common;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`プロトコルの読み込みに失敗しました: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export function saveProtocolAnswers(data) {
    const payload = {
        protocolId: data.protocolId || 'common',
        answers: data.answers || {}
    };

    try {
        localStorage.setItem('protocolAnswers', JSON.stringify(payload));
    } catch (error) {
        console.error('Protocol answers 保存に失敗しました', error);
    }
}

export function loadProtocolAnswers() {
    const saved = localStorage.getItem('protocolAnswers');
    if (!saved) {
        return null;
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error('Protocol answers 読み込みに失敗しました', error);
        return null;
    }
}
