// Retrieve history from local storage or initialize empty array
let history = JSON.parse(localStorage.getItem('history')) || [];

// Function to perform calculations and update history
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

    // Update history list and total amount
    updateHistory();
    updateTotalAmount();

    // Reset form fields
    document.getElementById('calcForm').reset();
    document.getElementById('wadaNo').focus();

    // Set the default visibility and values
    document.getElementById('batoType').value = 'गोरेटो बाटो';
    document.getElementById('fieldType').style.display = 'none';
    document.getElementById('mulyaPratiRopani').value = '';
}

// Function to update history list
function updateHistory() {
    const historyList = document.getElementById('history');
    historyList.innerHTML = '';

    history.forEach(item => {
        const historyItem = document.createElement('li');
        const formattedResult = `${item.wadaNo} - ${item.kittaNo} (${item.ropani}-${item.aana}-${item.paisa}-${item.daam}) ${item.batoType}${item.fieldType ? ` (${item.fieldType})` : ''} न्युनत्तम मुल्य = ${item.result}`;
        historyItem.textContent = formattedResult;
        historyList.appendChild(historyItem);
    });
}

// Function to update the total amount
function updateTotalAmount() {
    const totalAmountElem = document.getElementById('totalAmount');
    const totalAmount = history.reduce((sum, item) => sum + item.result, 0);
    totalAmountElem.textContent = totalAmount.toFixed(2);
}

// Function to auto-fill fields based on history
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
}

// Function to clear history and reset the total amount
function clearHistory() {
    history = [];
    localStorage.removeItem('history');
    updateHistory();
    updateTotalAmount();
}

// Event listener to show/hide field type dropdown
document.getElementById('batoType').addEventListener('change', function() {
    const fieldTypeDiv = document.getElementById('fieldType');
    if (this.value === 'नभएको') {
        fieldTypeDiv.style.display = 'block';
    } else {
        fieldTypeDiv.style.display = 'none';
    }
});

// Event listener to auto-fill fields when वडा नं. or कित्ता नं. changes
document.getElementById('wadaNo').addEventListener('input', () => {
    autoFillFields(document.getElementById('wadaNo').value, document.getElementById('kittaNo').value);
});

document.getElementById('kittaNo').addEventListener('input', () => {
    autoFillFields(document.getElementById('wadaNo').value, document.getElementById('kittaNo').value);
});

// Load history on page load
updateHistory();
updateTotalAmount();
