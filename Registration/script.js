// Retrieve history from local storage or initialize empty array
let history = JSON.parse(localStorage.getItem('history')) || [];

/* ---------------------- Nepali Number Format ----------------------- */
function toNepaliNumber(num) {
    const nepaliDigits = ['०','१','२','३','४','५','६','७','८','९'];
    return num.toString().replace(/[0-9]/g, d => nepaliDigits[d]);
}

/* ---------------------- Calculate Function ------------------------- */
function calculate() {
    const wadaNo = document.getElementById('wadaNo').value;
    const kittaNo = document.getElementById('kittaNo').value;
    const ropani = parseFloat(document.getElementById('ropani').value);
    const aana = parseFloat(document.getElementById('aana').value);
    const paisa = parseFloat(document.getElementById('paisa').value);
    const daam = parseFloat(document.getElementById('daam').value);
    const mulyaPratiRopaniInput = parseFloat(document.getElementById('mulyaPratiRopani').value) || 0;
    const batoType = document.getElementById('batoType').value;
    const fieldType = batoType === 'नभएको' ? document.getElementById('fieldTypeSelect').value : '';

    // Calculate the result
    const result = Math.ceil((ropani + aana / 16 + paisa / 64 + daam / 256) * mulyaPratiRopaniInput);

    // Add result to history
    const historyItem = {
        wadaNo,
        kittaNo,
        ropani,
        aana,
        paisa,
        daam,
        batoType,
        fieldType,
        mulyaPratiRopaniInput,
        result
    };
    history.push(historyItem);
    localStorage.setItem('history', JSON.stringify(history));

    // Update history + total
    updateHistory();
    updateTotalAmount();

    // Reset form
    document.getElementById('calcForm').reset();
    document.getElementById('wadaNo').focus();
    document.getElementById('batoType').value = 'गोरेटो बाटो';
    document.getElementById('fieldType').style.display = 'none';
    document.getElementById('mulyaPratiRopani').value = '';

    validateForm(); // disable calculate button again
}

/* ---------------------- History Display (Latest First) ---------------------- */
function updateHistory() {
    const historyList = document.getElementById('history');
    historyList.innerHTML = '';

    history.slice().reverse().forEach((item, index) => {
        const historyItem = document.createElement('li');

        const nepResult = toNepaliNumber(item.result);

        historyItem.innerHTML = `
            ${item.wadaNo} - ${item.kittaNo} 
            (${item.ropani}-${item.aana}-${item.paisa}-${item.daam})
            ${item.batoType}${item.fieldType ? ` (${item.fieldType})` : ''}
            = <b>${nepResult}</b>
            <button class="deleteItem" data-index="${index}">❌</button>
        `;

        historyList.appendChild(historyItem);
    });

    // Delete item event binding
    document.querySelectorAll('.deleteItem').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'));
            history.splice(history.length - 1 - idx, 1);
            localStorage.setItem('history', JSON.stringify(history));
            updateHistory();
            updateTotalAmount();
        });
    });
}

/* ---------------------- Total Amount in Nepali ---------------------- */
function updateTotalAmount() {
    const totalAmountElem = document.getElementById('totalAmount');
    const totalAmount = history.reduce((sum, item) => sum + item.result, 0);
    totalAmountElem.textContent = toNepaliNumber(totalAmount.toFixed(0));
}

/* ---------------------- Auto Fill Fields Based on History ---------------------- */
function autoFillFields(wadaNo, kittaNo) {
    const matchingEntry = history.find(item => item.wadaNo === wadaNo && item.kittaNo === kittaNo);

    if (matchingEntry) {
        document.getElementById('mulyaPratiRopani').value = matchingEntry.mulyaPratiRopaniInput;
        document.getElementById('batoType').value = matchingEntry.batoType;

        if (matchingEntry.batoType === 'नभएको') {
            document.getElementById('fieldType').style.display = 'block';
            document.getElementById('fieldTypeSelect').value = matchingEntry.fieldType;
        } else {
            document.getElementById('fieldType').style.display = 'none';
        }
    } else {
        document.getElementById('mulyaPratiRopani').value = '';
        document.getElementById('batoType').value = 'गोरेटो बाटो';
        document.getElementById('fieldType').style.display = 'none';
    }

    validateForm();
}

/* ---------------------- Clear Entire History ---------------------- */
function clearHistory() {
    history = [];
    localStorage.removeItem('history');
    updateHistory();
    updateTotalAmount();
}

/* ---------------------- Show/Hide Field Type ---------------------- */
document.getElementById('batoType').addEventListener('change', function () {
    if (this.value === 'नभएको') {
        document.getElementById('fieldType').style.display = 'block';
    } else {
        document.getElementById('fieldType').style.display = 'none';
    }
});

/* ---------------------- Auto-fill Wada/Kitta ---------------------- */
document.getElementById('wadaNo').addEventListener('input', () => {
    autoFillFields(document.getElementById('wadaNo').value, document.getElementById('kittaNo').value);
});

document.getElementById('kittaNo').addEventListener('input', () => {
    autoFillFields(document.getElementById('wadaNo').value, document.getElementById('kittaNo').value);
});

/* ---------------------- Auto Calculate on TAB after Daam ---------------------- */
document.getElementById('daam').addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
        const mulyaValue = parseFloat(document.getElementById('mulyaPratiRopani').value);

        if (!isNaN(mulyaValue) && mulyaValue > 0) {
            setTimeout(() => calculate(), 10);
        }
    }
});

/* ---------------------- Enable/Disable Calculate Button ---------------------- */
function validateForm() {
    const wada = document.getElementById('wadaNo').value.trim();
    const kitta = document.getElementById('kittaNo').value.trim();
    const r = document.getElementById('ropani').value;
    const a = document.getElementById('aana').value;
    const p = document.getElementById('paisa').value;
    const d = document.getElementById('daam').value;
    const m = document.getElementById('mulyaPratiRopani').value;

    const calcBtn = document.getElementById('calculateBtn');

    if (wada && kitta && r && a && p && d && m > 0) {
        calcBtn.disabled = false;
    } else {
        calcBtn.disabled = true;
    }
}

['wadaNo','kittaNo','ropani','aana','paisa','daam','mulyaPratiRopani']
.forEach(id => {
    document.getElementById(id).addEventListener('input', validateForm);
});

/* ---------------------- Load History on Page Load ---------------------- */
updateHistory();
updateTotalAmount();
validateForm();
