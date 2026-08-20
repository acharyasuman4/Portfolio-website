// १. रोक्का छान्न मिल्ने कार्डहरू बनाउने
function renderRokkaSelectors() {
    const container = document.getElementById('rokka-kitta-selector');
    if (!container || lands.length === 0) {
        container.innerHTML = "<p class='text-[10px] text-gray-400 italic'>पहिले जग्गा विवरण भर्नुहोस्</p>";
        return;
    }

    container.innerHTML = lands.map(l => `
        <div id="card_rk_${l.id}" class="kitta-card p-2 border border-slate-300 rounded cursor-pointer inline-block m-1 min-w-[70px]" 
             onclick="toggleRKSelection(${l.id})">
            <input type="checkbox" id="rk_cb_${l.id}" class="rk-cb hidden" value="${l.id}">
            <div class="text-[11px] font-bold">कि.नं. ${toNepaliDigits(l.kitta)}</div>
        </div>
    `).join('');
}

// २. कार्ड क्लिक गर्दा रातो बनाउने (Selection Logic)
function toggleRKSelection(id) {
    const cb = document.getElementById('rk_cb_' + id);
    const card = document.getElementById('card_rk_' + id);
    if (cb && card) {
        cb.checked = !cb.checked;
        card.classList.toggle('selected', cb.checked);
        // अडालट स्टाइलमा रातो बोर्डर
        card.style.borderColor = cb.checked ? "#ef4444" : "#e2e8f0";
        card.style.backgroundColor = cb.checked ? "#fef2f2" : "#ffffff";
    }
}

// ३. नयाँ रोक्का इन्ट्री थप्ने
function addRokka() {
    const selectedCbs = document.querySelectorAll('.rk-cb:checked');
    const kittaIds = Array.from(selectedCbs).map(c => parseInt(c.value));

    if (kittaIds.length === 0) { alert("कृपया रोक्का भएका कित्ताहरू छान्नुहोस् ।"); return; }

    const auth = document.getElementById('r_auth').value;
    const chanum = document.getElementById('r_chanum').value;
    const date = document.getElementById('r_date').value;

    if (!auth || !chanum || !date) { alert("निकाय, च.नं. र मिति भर्नुहोस् ।"); return; }

    rokkaEntries.push({
        kittaIds: kittaIds,
        auth: auth,
        chanum: chanum,
        date: date,
        isRokka: true,
        selectedForFukuwa: false // डि़फल्टमा फुकुवा नहुने
    });

    // फर्म सफा गर्ने
    document.getElementById('r_auth').value = '';
    document.getElementById('r_chanum').value = '';
    document.getElementById('r_date').value = '';
    
    renderRokkaSelectors();
    renderRokkaList();
    updateAll();
}

// ४. रोक्काको सूची र फुकुवा अप्सन देखाउने
function renderRokkaList() {
    const summary = document.getElementById('rokka-summary');
    const fukuwaOpts = document.getElementById('fukuwa_options');

    summary.innerHTML = rokkaEntries.map((re, i) => `
        <div class="bg-white border p-1 text-[10px] flex justify-between items-center rounded shadow-sm">
            <span class="font-bold text-orange-700">🚩 ${re.auth} (च.नं. ${toNepaliDigits(re.chanum)})</span>
            <button onclick="rokkaEntries.splice(${i},1); renderRokkaList(); updateAll();" class="text-red-500 font-bold px-1">✕</button>
        </div>
    `).join('');

    fukuwaOpts.innerHTML = rokkaEntries.map((re, i) => `
        <label class="flex items-center gap-2 text-[10px] cursor-pointer">
            <input type="checkbox" ${re.selectedForFukuwa ? 'checked' : ''} 
                onchange="rokkaEntries[${i}].selectedForFukuwa = this.checked; updateAll();"> 
            ${re.auth} (च.नं. ${toNepaliDigits(re.chanum)}) फुकुवा गर्ने
        </label>
    `).join('');
}

// ५. स्मार्ट रोक्का वाक्यांश (Tippani Para को लागि)
function generateSmartRokkaText() {
    if (lands.length === 0) return ".......";
    if (rokkaEntries.length === 0) return "रोक्का नरहेको";

    const groupMap = {};
    const unblockedKittas = [];

    lands.forEach(l => {
        const matchingEntries = rokkaEntries.filter(re => re.kittaIds.includes(l.id));
        if (matchingEntries.length > 0) {
            const key = matchingEntries.map(re => `${re.auth}को च.नं. ${toNepaliDigits(re.chanum)} मिति ${convertDate(re.date)}`).join(' र ');
            if (!groupMap[key]) groupMap[key] = [];
            groupMap[key].push(toNepaliDigits(l.kitta));
        } else {
            unblockedKittas.push(toNepaliDigits(l.kitta));
        }
    });

    let parts = [];
    Object.keys(groupMap).forEach(key => {
        parts.push(`कि.नं. ${nepaliJoin(groupMap[key])} ${key} को पत्रले रोक्का रहेको`);
    });
    
    if (unblockedKittas.length > 0) {
        parts.push(`कि.नं. ${nepaliJoin(unblockedKittas)} रोक्का नरहेको`);
    }

    return nepaliJoin(parts) + " व्यहोरा";
}