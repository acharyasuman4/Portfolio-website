// --- GLOBAL STATE FOR VALUATION ---
let valuationDb = [];
let houseEntries = [];
let recommendations = [];

// --- 1. DATA LOADING ---
async function loadValuationDb() {
    try {
        const res = await fetch('/registration/land_valuation_final.json');
        valuationDb = await res.json();
    } catch (e) { console.error("Valuation DB Load Failed"); }
}
loadValuationDb(); // Run on startup

// --- 2. SMART FILTERING ENGINE ---
function findLocalUnitByVdc(vdcName) {
    if (!vdcName || !valuationDb.districts) return null;
    for (const dist of valuationDb.districts) {
        for (const local of dist.locals) {
            if (local.mapping.some(m => m.links.some(link => link.vdc === vdcName))) return local;
        }
    }
    return null;
}

function wardMatches(inputWard, targetWardStr) {
    if (!targetWardStr) return false;
    const current = parseInt(toEnglish(inputWard));
    const parts = targetWardStr.split(',').map(p => p.trim());
    for (let part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(toEnglish(n)));
            if (current >= start && current <= end) return true;
        } else {
            if (parseInt(toEnglish(part)) === current) return true;
        }
    }
    return false;
}


// --- 3. UI RENDERING (ADALAT STYLE) ---
function openValuationModal() {
    const modal = document.getElementById('valModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex'; // block को सट्टा flex
    syncRecommendations();
    renderValuationTable();
}

function closeValuationModal() {
    const modal = document.getElementById('valModal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    updateAll();
}

function renderValuationTable() {
    const content = document.getElementById('modal-content');
    
    // 1. घरबाटो सिफारिस खण्ड (Recommendation Section)
    let html = `
    <div class="bg-slate-800 p-4 rounded-xl border-2 border-slate-600 mb-6 text-white shadow-inner">
        <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-yellow-400">📄 घरबाटो सिफारिसको विवरण</h3>
            <button onclick="recommendations.push({localName:'', newWard:'', chanum:'', date:''}); renderValuationTable();" 
                    class="bg-emerald-600 text-white px-3 py-1 rounded text-xs hover:bg-emerald-700">+ थप्नुहोस्</button>
        </div>
        <div class="space-y-2">
            ${recommendations.map((r, i) => `
                <div class="grid grid-cols-12 gap-2 items-center bg-slate-700 p-2 rounded border border-slate-500">
                    <div class="col-span-4">
                        <label class="text-[9px] text-slate-300">स्थानीय तह</label>
                        <input type="text" value="${r.localName}" oninput="recommendations[${i}].localName=this.value; saveToLocal();" 
                               class="w-full p-1 text-black text-xs rounded font-bold outline-none">
                    </div>
                    <div class="col-span-2">
                        <label class="text-[9px] text-slate-300">वडा नं.</label>
                        <input type="text" value="${toNepaliDigits(r.newWard)}" oninput="recommendations[${i}].newWard=this.value; saveToLocal();" 
                               class="w-full p-1 text-black text-xs rounded text-center outline-none">
                    </div>
                    <div class="col-span-2">
                        <label class="text-[9px] text-slate-300">च.नं.</label>
                        <input type="text" value="${toNepaliDigits(r.chanum)}" oninput="recommendations[${i}].chanum=this.value; saveToLocal();" 
                               class="w-full p-1 text-black text-xs rounded text-center outline-none">
                    </div>
                    <div class="col-span-3">
                        <label class="text-[9px] text-slate-300">मिति</label>
                        <input type="text" value="${toNepaliDigits(r.date)}" oninput="recommendations[${i}].date=this.value; saveToLocal();" 
                               class="w-full p-1 text-black text-xs rounded text-center outline-none">
                    </div>
                    <div class="col-span-1 pt-3 text-center">
                        <button onclick="recommendations.splice(${i},1); renderValuationTable();" class="text-red-400">✕</button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;

    // 2. जग्गा मुल्याङ्कन टेबल (Land Valuation Table)
    html += `
    <div class="overflow-x-auto mb-6">
        <table class="w-full text-[14px] border-collapse bg-white border border-slate-300 shadow-md">
            <thead>
                <tr class="bg-slate-200 text-slate-700">
                    <th class="border p-2">कि.नं.</th><th class="border p-2">क्षेत्रफल</th>
                    <th class="border p-2">बाटोको प्रकार (Road)</th><th class="border p-2">वर्गीकरण</th>
                    <th class="border p-2" style="width:100px;">दर (Rate)</th>
                    <th class="border p-2" style="width:120px;">कुल थैली</th>
                </tr>
            </thead><tbody>`;

    lands.forEach((l) => {
        const roads = getRoadOptionsForLand(l);
        const dlId = `roads_${l.id}`;
        html += `<datalist id="${dlId}">${roads.map(r => `<option value="${r.name}">`).join('')}</datalist>`;
        
        html += `<tr>
            <td class="border p-1 text-center font-bold text-blue-800">${toNepaliDigits(l.kitta)}</td>
            <td class="border p-1 text-center">${l.area || '०'}</td>
            <td class="border p-1">
                <input type="text" list="${dlId}" class="w-full border p-1 rounded text-[10px]" value="${l.road || ''}" 
                       oninput="updateValEntry(${l.id}, 'road', this.value)">
            </td>
            <td class="border p-1">
                <input type="text" list="class_list_standard" class="w-full border p-1 rounded text-[10px] bg-blue-50" value="${l.class || ''}" 
                       oninput="updateValEntry(${l.id}, 'class', this.value)">
            </td>
            <td class="border p-1">
                <input type="text" id="rate_${l.id}" class="w-full border p-1 text-center font-bold text-blue-600" 
                       value="${l.rate ? toNepaliDigits(l.rate) : ''}" 
                       oninput="l.rate=toEnglish(this.value); calcThaili(${l.id})">
            </td>
            <td class="border p-1">
                <input type="text" id="val_${l.id}" class="w-full bg-amber-50 p-1 text-center font-bold text-red-700" 
                       value="${baseValuations[l.id] ? toNepaliDigits(baseValuations[l.id]) : ''}" readonly>
            </td>
        </tr>`;
    });

    html += `</tbody></table></div>` + renderHouseValuationPart(); 
    content.innerHTML = html;
}

// --- 4. CALCULATION LOGIC ---
function updateValEntry(landId, key, val) {
    const l = lands.find(x => x.id === landId);
    l[key] = val;
    if (key === 'road' || key === 'class') {
        const local = findLocalUnitByVdc(l.vdc);
        const match = valuationDb.valuations.find(v => v.road === l.road && v.lId === (local?local.id:null) && (v.classification === l.class || v.classification === "सबै"));
        if (match) {
            l.rate = match.price;
            document.getElementById(`rate_${landId}`).value = toNepaliDigits(match.price);
        }
    }
    calcThaili(landId);
}

// १. वर्गीकरण मिलाउने सहयोगी फङ्सन (Normalization)
function normalizeClass(str) {
    if (!str) return "";
    return str.toString()
        .replace(/क्षेत्र/g, "")
        .replace(/इलाका/g, "")
        .trim();
}

function getPriceFromJson(roadName, className, land) {
    if (!valuationDb || !valuationDb.valuations || !roadName) return 0;

    const local = findLocalUnitByVdc(land.vdc);
    if (!local) return 0;

    // १. यो बाटो र यो पालिकाका सबै सम्भावित दररेटहरू फिल्टर गर्ने
    const relevant = valuationDb.valuations.filter(v => {
        if (v.road !== roadName || v.lId !== local.id) return false;
        
        // "सबै पालिका" (string) वा scope: all भएकोलाई स्विकार्ने
        if (v.scope === "all" || typeof v.targets === 'string') return true;
        
        // targets एरे भित्र VDC र Ward चेक गर्ने
        if (Array.isArray(v.targets)) {
            return v.targets.some(t =>
                t.vdc === land.vdc && wardMatches(land.ward, t.oldWard || t.oldW || t.currentWard)
            );
        }
        return false;
    });

    if (relevant.length === 0) return 0;

    const targetNorm = className ? className.trim() : "";

    // २. प्राथमिकताको आधारमा रेट छान्ने (Priority Logic):
    // Priority 1: Exact Classification Match (आवासीय/कृषि)
    let match = relevant.find(v => v.classification === targetNorm);

    // Priority 2: Fuzzy Match (यदि 'आवासीय क्षेत्र' को सट्टा 'आवासीय' मात्र टाइप भएमा)
    if (!match && targetNorm) {
        match = relevant.find(v => v.classification && v.classification.includes(targetNorm));
    }

    // Priority 3: "सबै" वा classification को 'की' नै नभएको (Bhotekoshi Fix)
    if (!match) {
        match = relevant.find(v => v.classification === "सबै") || 
                relevant.find(v => !v.classification); // भोटेकोशीको खाली classification समात्न
    }

    // ४. यदि केही नमिले पहिलो उपलब्ध रेट दिने
    if (!match) match = relevant[0];

    return match ? parseFloat(match.price) : 0;
}

function getRoadOptionsForLand(land) {
    const local = findLocalUnitByVdc(land.vdc);
    let rawRoads = [];

    if (local && valuationDb.valuations) {
        rawRoads = valuationDb.valuations.filter(v => {
            if (v.lId !== local.id) return false;
            // "सबै पालिका" भएको स्ट्रिङ वा scope: all लाई स्विकार्ने
            if (v.scope === "all" || typeof v.targets === 'string') return true;
            return v.targets.some(t => t.vdc === land.vdc && wardMatches(land.ward, t.oldWard || t.oldW));
        });
    }

    const roadMap = {};
    rawRoads.forEach(r => {
        if (!roadMap[r.road] || parseFloat(r.price) > roadMap[r.road]) {
            roadMap[r.road] = parseFloat(r.price);
        }
    });

    let uniqueRoads = Object.keys(roadMap).map(name => ({ name: name, price: roadMap[name] }));
    uniqueRoads.sort((a, b) => b.price - a.price);

    if (uniqueRoads.length === 0) {
        return ["नभएको", "गोरेटो बाटो", "कच्ची मोटरबाटो"].map(d => ({ name: d, price: 0 }));
    }
    return uniqueRoads;
}

// ३. इन्पुट परिवर्तन हुँदा रेट अपडेट गर्ने फङ्सन
function updateValEntry(landId, key, val) {
    const l = lands.find(x => x.id === landId);
    if (!l) return;

    l[key] = val; // सडक वा वर्गीकरण अपडेट गर्ने

    // यदि बाटो छानिएको छ भने रेट खोज्ने
    if (l.road) {
        const price = getPriceFromJson(l.road, l.class, l);
        l.rate = price;
        
        // UI मा रेट देखाउने
        const rateInput = document.getElementById(`rate_${landId}`);
        if (rateInput) {
            rateInput.value = price > 0 ? toNepaliDigits(price) : "";
        }
    }

    calcThaili(landId);
    saveToLocal();
}

// घरको विवरणलाई आधिकारिक वाक्यांशमा बदल्ने फङ्सन
function getHousePhrase() {
    if (!houseEntries || houseEntries.length === 0) return "";

    let phrases = houseEntries.map(h => {
        const kittaNo = toNepaliDigits(h.kitta) || "...";
        const count = toEnglish(h.count);
        const price = toEnglish(h.price);
        
        // मूल्यलाई अंक र अक्षरमा ढाल्ने (उदा: १०,००,००० (दश लाख रूपैयाँ))
        const priceWords = `${formatNepaliMoney(price)} (${numberToNepaliWords(price)} रूपैयाँ)`;
        
        const countText = count > 1 ? `${toNepaliDigits(count)} वटा` : `एउटा`;
        
        return `कि.नं. ${kittaNo} मा रहेको ${countText} घरको मूल्य रू ${priceWords}`;
    });

    // सबै घरका वाक्यांशहरूलाई "र" ले जोड्ने र अन्त्यमा "समेत गरि" थप्ने
    return nepaliJoin(phrases) + " समेत गरि हुन आउने ";
}

function calcThaili(landId) {
    const l = lands.find(x => x.id === landId);
    if (!l) return;

    const engRate = parseFloat(l.rate) || 0;
    let areaInRopani = 0;

    // क्षेत्रफललाई रोपनीमा बदल्ने
    if (l.sqm && toEnglish(l.sqm) > 0) {
        areaInRopani = toEnglish(l.sqm) / 508.74;
    } else {
        const r = parseFloat(toEnglish(l.r)) || 0;
        const a = parseFloat(toEnglish(l.a)) || 0;
        const p = parseFloat(toEnglish(l.p)) || 0;
        const d = parseFloat(toEnglish(l.d)) || 0;
        areaInRopani = r + (a / 16) + (p / 64) + (d / 256);
    }

    const totalVal = Math.ceil(engRate * areaInRopani);
    baseValuations[landId] = totalVal;

    // UI अपडेट
    const valField = document.getElementById(`val_${landId}`);
    if (valField) {
        valField.value = totalVal > 0 ? toNepaliDigits(totalVal) : "";
    }
}

// १. हाल उपलब्ध सबै कित्ताहरूको सुची तयार पार्ने (Helper)
function getAvailableKittas() {
    let list = [];
    lands.forEach(l => {
        if (l.kitta) list.push(l.kitta);
    });
    // Duplicate हटाउने
    return [...new Set(list)];
}

// २. घर मुल्याङ्कन भागको UI (Updated with Dropdown)
function renderHouseValuationPart() {
    const allKittas = getAvailableKittas();
    
    let hHtml = `
    <div class="bg-indigo-50 p-4 rounded-xl border-2 border-indigo-300 shadow-md mt-4">
        <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-indigo-800 text-sm">🏠 घरको मुल्याङ्कन विवरण</h3>
            <button onclick="houseEntries.push({kitta:'', count:'१', price:''}); renderValuationTable();" 
                    class="bg-indigo-600 text-white px-4 py-1 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm">+ घर थप्नुहोस्</button>
        </div>
        <table class="w-full text-xs border-collapse bg-white border border-slate-300">
            <thead>
                <tr class="bg-indigo-100 text-indigo-900">
                    <th class="border p-2 text-left">कित्ता विवरण</th>
                    <th class="border p-2" style="width:80px;">घर संख्या</th>
                    <th class="border p-2" style="width:150px;">मुल्य (रू.)</th>
                    <th class="border p-2" style="width:40px;">#</th>
                </tr>
            </thead>
            <tbody>`;

    if (houseEntries.length === 0) {
        hHtml += `<tr><td colspan="4" class="p-4 text-center text-slate-400 italic">कुनै घर थपिएको छैन ।</td></tr>`;
    }

    houseEntries.forEach((h, i) => {
        hHtml += `<tr>
            <td class="border p-1">
                <select onchange="houseEntries[${i}].kitta=this.value; saveToLocal();" 
                        class="w-full p-1.5 border border-slate-400 rounded font-bold text-slate-800 bg-white outline-none">
                    <option value="">-- कित्ता छान्नुहोस् --</option>
                    ${allKittas.map(k => `
                        <option value="${k}" ${h.kitta == k ? 'selected' : ''}>
                            कि.नं. ${toNepaliDigits(k)}
                        </option>
                    `).join('')}
                </select>
            </td>
            <td class="border p-1">
                <input type="text" value="${h.count || '१'}" 
                       oninput="houseEntries[${i}].count=this.value; saveToLocal();" 
                       class="w-full p-1.5 border border-slate-400 rounded text-center font-bold outline-none">
            </td>
            <td class="border p-1">
                <input type="text" value="${h.price || ''}" 
                       oninput="houseEntries[${i}].price=this.value; updateAll();" 
                       class="w-full p-1.5 border border-slate-400 rounded text-right font-bold text-indigo-700 outline-none" 
                       placeholder="0.00">
            </td>
            <td class="border p-1 text-center">
                <button onclick="houseEntries.splice(${i},1); renderValuationTable(); updateAll();" 
                        class="text-red-600 hover:text-red-800 font-bold p-1">✕</button>
            </td>
        </tr>`;
    });
    
    return hHtml + `</tbody></table></div>`;
}

function generateRecPhrase() {
    const validRecs = recommendations.filter(r => r.chanum && r.chanum.trim() !== "");
    
    // यदि सिफारिस भरिएको छैन भने
    if (validRecs.length === 0) return "माग भएका जग्गाहरूको मुल्याङ्कन";

    // सिफारिसहरू भएमा वाक्यांश बनाउने
    const recPhrases = validRecs.map(r => {
        const local = r.localName || ".......";
        const ward = toNepaliDigits(r.newWard) || "..";
        const chanum = toNepaliDigits(r.chanum);
        const date = convertDate(r.date) || ".......";
        return `${local} वडा नं. ${ward} कार्यालयको च.नं. ${chanum} मिति ${date} को घरबाटो सिफारिस`;
    });

    let finalPhrase = nepaliJoin(recPhrases);

    // वर्गीकरण थपिएको छ कि छैन जाँच
    let hasClassification = lands.some(l => l.class && l.class.trim() !== "");
    if (hasClassification) {
        finalPhrase += " र वर्गीकरण";
    }

    return finalPhrase;
}

// १. साविकबाट हालको स्थानीय तह र वडा पत्ता लगाउने (Adalat Logic)
function getLocalFromSabik(vdc, ward) {
    if (!valuationDb || !valuationDb.districts) return null;
    
    // अफिस सेटिङबाट जिल्ला लिने (डिफल्ट सिन्धुपाल्चोक)
    const settings = JSON.parse(localStorage.getItem('global_office_settings')) || { def_dist: "सिन्धुपाल्चोक" };
    const distData = valuationDb.districts.find(d => d.name === settings.def_dist);
    if (!distData) return null;

    for (const local of distData.locals) {
        for (const map of local.mapping) {
            // JSON भित्र links मा साविक VDC र Ward खोज्ने
            const match = map.links.find(link => 
                link.vdc.trim() === vdc.trim() && 
                wardMatches(ward, link.oldW) // wardMatches पहिलेकै फङ्सन हो
            );
            
            if (match) {
                return { localName: local.name, newWard: map.wardNo };
            }
        }
    }
    return null;
}

// २. जग्गाको आधारमा सिफारिस लिस्ट अपडेट गर्ने (Add if not same)
function syncRecommendations() {
    lands.forEach(l => {
        const mapping = getLocalFromSabik(l.vdc, l.ward);
        if (mapping) {
            // यदि यो स्थानीय तह र वडा पहिले नै लिस्टमा छ कि छैन चेक गर्ने
            const exists = recommendations.some(r => 
                r.localName === mapping.localName && 
                toEnglish(r.newWard) == toEnglish(mapping.newWard)
            );
            
            // छैन भने नयाँ इन्ट्री थप्ने
            if (!exists) {
                recommendations.push({
                    localName: mapping.localName,
                    newWard: mapping.newWard,
                    chanum: '',
                    date: ''
                });
            }
        }
    });
}