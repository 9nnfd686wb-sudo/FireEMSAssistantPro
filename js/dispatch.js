import { saveDispatchData } from './storage.js';

// dispatch.js: 119受付ページの入力と保存を担当する
// 判定ロジックはここに書かず、画面のみを扱う

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dispatchForm');
    const backBtn = document.getElementById('backBtn');
    const callTimeInput = document.getElementById('callTime');

    if (!form) return;

    // 通報時間を現在時刻で初期化
    const now = new Date();
    callTimeInput.value = formatDateTimeLocal(now);

    backBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const data = {
            callerName: document.getElementById('callerName').value.trim(),
            patientName: document.getElementById('patientName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            callTime: document.getElementById('callTime').value,
            age: document.getElementById('age').value.trim(),
            sex: document.getElementById('sex').value,
            chiefComplaint: document.getElementById('chiefComplaint').value.trim(),
            memo: document.getElementById('memo').value.trim()
        };

        const errors = validateDispatchData(data);
        if (Object.keys(errors).length > 0) {
            displayErrors(errors);
            return;
        }

        saveDispatchData(data);
        window.location.href = 'symptoms.html';
    });
});

function formatDateTimeLocal(date) {
    const pad = (value) => String(value).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function validateDispatchData(data) {
    const errors = {};

    if (!data.address) {
        errors.address = '住所は必須です。';
    }

    if (data.phone) {
        if (!/^[0-9\-]+$/.test(data.phone)) {
            errors.phone = '電話番号は数字のみまたはハイフン付きで入力してください。';
        }
    }

    if (data.age) {
        const ageValue = Number(data.age);
        if (Number.isNaN(ageValue) || ageValue < 0 || ageValue > 120) {
            errors.age = '年齢は0〜120の範囲で入力してください。';
        }
    }

    return errors;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach((el) => {
        el.textContent = '';
    });
}

function displayErrors(errors) {
    Object.entries(errors).forEach(([field, message]) => {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    });
}
