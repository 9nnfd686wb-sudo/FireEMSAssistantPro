document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dispatchForm');
    const nextBtn = document.getElementById('nextBtn');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Use native validation first
        if (!form.reportValidity()) {
            return;
        }

        const data = {
            callerName: document.getElementById('callerName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            patientName: document.getElementById('patientName').value.trim(),
            age: parseInt(document.getElementById('age').value, 10) || null,
            location: document.getElementById('location').value.trim(),
            timestamp: new Date().toISOString()
        };

        // Additional simple checks
        if (data.phone && !/^0[0-9\- ]{8,}$/.test(data.phone)) {
            alert('電話番号の形式を確認してください。');
            return;
        }

        // Save to LocalStorage
        try {
            localStorage.setItem('dispatchData', JSON.stringify(data));
        } catch (err) {
            console.error('LocalStorage error', err);
        }

        // Navigate to symptoms selection (same folder)
        window.location.href = 'symptoms.html';
    });
});
