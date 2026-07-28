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
