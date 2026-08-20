let editId = null; // कुन जग्गा इडिट भइरहेको छ ट्रयाक गर्न

// १. जग्गा कार्डहरू रेन्डर गर्ने (Edit र Cancel बटन सहित)
function renderLandUI() {
    const container = document.getElementById('land-list-ui');
    if (!container) return;
    
    const radio = document.querySelector('input[name="global_area_type"]:checked');
    const areaSystem = radio ? radio.value : 'traditional';

    container.innerHTML = lands.map((l) => {
        return `
        <div class="bg-white border border-slate-300 p-2 rounded shadow-sm mb-2">
            <div class="flex items-center justify-between gap-2">
                <div class="text-xs font-bold text-blue-800 whitespace-nowrap">
                    ${l.vdc}-${toNepaliDigits(l.ward)} (कि.नं. ${toNepaliDigits(l.kitta)})
                </div>
                
                <div class="flex items-center gap-1">
                    <!-- क्षेत्रफल इनपुटहरू -->
                    ${areaSystem === 'traditional' ?
                        `<input type="text" value="${l.r || ''}" oninput="updateLandData(${l.id},'r',this.value)" placeholder="र" class="w-8 border p-1 text-center text-xs rounded bg-yellow-50 focus:bg-white">
                         <input type="text" value="${l.a || ''}" oninput="updateLandData(${l.id},'a',this.value)" placeholder="आ" class="w-8 border p-1 text-center text-xs rounded bg-yellow-50 focus:bg-white">
                         <input type="text" value="${l.p || ''}" oninput="updateLandData(${l.id},'p',this.value)" placeholder="पै" class="w-8 border p-1 text-center text-xs rounded bg-yellow-50 focus:bg-white">
                         <input type="text" value="${l.d || ''}" oninput="updateLandData(${l.id},'d',this.value)" placeholder="दा" class="w-8 border p-1 text-center text-xs rounded bg-yellow-50 focus:bg-white">`
                        : `<input type="text" value="${l.sqm || ''}" oninput="updateLandData(${l.id},'sqm',this.value)" placeholder="व.मि." class="w-20 border p-1 text-right text-xs rounded bg-yellow-50 focus:bg-white">`
                    }

                    <!-- Edit र Cancel बटनहरू -->
                    <div class="flex items-center gap-1 border-l pl-2 ml-1">
                        <button onclick="editLandData(${l.id})" class="text-blue-600 font-bold text-xs hover:underline">Edit</button>
                        <button onclick="removeLandEntry(${l.id})" class="text-red-500 font-bold text-xs hover:underline">✕</button>
                    </div>
                </div>
            </div>
        </div>`
    }).join('');
    
    // रोक्का र मुल्याङ्कनका लिस्टहरू पनि अपडेट गर्ने
    renderBaseValuationUI(); 
    renderRokkaSelectors();
}

// २. जग्गा थप्ने वा सच्याउने (Same / New)
function addNewLandEntry(type) {
    const vdc = document.getElementById('l_vdc').value.trim();
    const ward = document.getElementById('l_ward').value.trim();
    const kitta = document.getElementById('l_kitta').value.trim();

    if (!vdc || !kitta) { alert("गा.वि.स. र कि.नं. अनिवार्य छ"); return; }

    if (editId !== null) {
        // Edit Mode: डाटा अपडेट गर्ने
        const idx = lands.findIndex(x => x.id === editId);
        if (idx > -1) {
            lands[idx].vdc = vdc;
            lands[idx].ward = ward;
            lands[idx].kitta = kitta;
        }
        editId = null;
        document.getElementById('btn_same').innerText = "+ Same";
        document.getElementById('btn_new').innerText = "+ New";
    } else {
        // Add Mode: नयाँ जग्गा थप्ने
        lands.push({ 
            id: Date.now(), vdc, ward, kitta, 
            r: '', a: '', p: '', d: '', sqm: '' 
        });
    }

    // इनपुट क्लिन गर्ने
    if (type === 'new') {
        document.getElementById('l_vdc').value = '';
        document.getElementById('l_ward').value = '';
        document.getElementById('l_vdc').focus();
    } else {
        document.getElementById('l_kitta').focus();
    }
    document.getElementById('l_kitta').value = '';

    renderLandUI();
    updateAll();
}

// ३. Edit बटन थिच्दा डाटा बक्समा लैजाने
function editLandData(id) {
    const l = lands.find(x => x.id === id);
    if (!l) return;
    editId = id;
    document.getElementById('l_vdc').value = l.vdc;
    document.getElementById('l_ward').value = l.ward;
    document.getElementById('l_kitta').value = l.kitta;
    document.getElementById('btn_same').innerText = "Update (Same)";
    document.getElementById('btn_new').innerText = "Update (New)";
    document.getElementById('l_kitta').focus();
}

// ४. डाटा सच्याउँदा (In-card edit) तत्काल सेभ गर्ने
function updateLandData(id, key, val) {
    const land = lands.find(x => x.id === id);
    if (land) {
        land[key] = val;
        // क्षेत्रफल अपडेट (R-A-P-D वा Sqm)
        const unit = document.querySelector('input[name="global_area_type"]:checked').value;
        if (unit === 'traditional') {
            land.area = `${toNepaliDigits(land.r || '०')}-${toNepaliDigits(land.a || '०')}-${toNepaliDigits(land.p || '०')}-${toNepaliDigits(land.d || '०')}`;
        } else {
            land.area = toNepaliDigits(land.sqm || '०') + " व.मि.";
        }
        updateAll();
    }
}

// ५. जग्गा हटाउने
function removeLandEntry(id) {
    lands = lands.filter(x => x.id !== id);
    renderLandUI();
    updateAll();
}