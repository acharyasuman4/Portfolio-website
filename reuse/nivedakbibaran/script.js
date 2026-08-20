let editAppId = null;

// Goal 1: Update Misil Preview
function updateMisilPreview() {
    const misnum = document.getElementById('in_misnum').value;
    const misdate = document.getElementById('in_misdate').value;
    document.getElementById('out_misnum').innerText = toNepaliDigits(misnum) || ".......";
    document.getElementById('out_misdate').innerText = convertDate(misdate) || ".......";
}

// Goal 2: Adalat-Style Applicant Logic
function pushApplicant() {
    const nameEl = document.getElementById('temp_app_name');
    const name = nameEl.value.trim();
    if (!name) return alert("नाम खाली छ");

    const relType = document.querySelector('input[name="rel_temp"]:checked').value;

    const appData = {
        name: name,
        f: document.getElementById('temp_app_f').value,
        gf: document.getElementById('temp_app_gf').value,
        dist: document.getElementById('temp_app_dist').value,
        addr: document.getElementById('temp_app_addr').value,
        relType: relType
    };

    if (editAppId !== null) {
        const index = applicants.findIndex(a => a.id === editAppId);
        if (index > -1) applicants[index] = { ...applicants[index], ...appData };
        editAppId = null;
    } else {
        applicants.push({ id: Date.now(), ...appData });
    }

    nameEl.value = ''; // Clear name only to keep other details for next entry
    renderApplicants();
    updateAll();
}

function renderApplicants() {
    const listHtml = applicants.map((a, i) => `
        <div class="flex justify-between items-center bg-white p-2 mb-1 rounded border border-indigo-200 shadow-sm">
            <span class="text-xs font-bold text-slate-700">${toNepaliDigits(i + 1)}. ${a.name}</span>
            <div class="flex gap-2">
                <button onclick="editApp(${i})" class="text-blue-600 text-[10px] hover:underline">Edit</button>
                <button onclick="applicants.splice(${i},1); renderApplicants(); updateAll();" class="text-red-600 text-[10px]">✕</button>
            </div>
        </div>
    `).join('');
    document.getElementById('applicant-list-items').innerHTML = listHtml;
}

function editApp(i) {
    const a = applicants[i];
    editAppId = a.id;
    document.getElementById('temp_app_name').value = a.name;
    document.getElementById('temp_app_f').value = a.f;
    document.getElementById('temp_app_gf').value = a.gf;
    document.getElementById('temp_app_dist').value = a.dist;
    document.getElementById('temp_app_addr').value = a.addr;
    document.querySelector(`input[name="rel_temp"][value="${a.relType}"]`).checked = true;
}

// Table Generation for Tippani (Matches Adalat)
function renderApplicantTable() {
    let tableHtml = "";
    let snCount = 1;
    const fatherRelApps = applicants.filter(a => a.relType === 'father');
    const husbandRelApps = applicants.filter(a => a.relType === 'husband');

    function generateSubTable(apps, h1, h2) {
        if (apps.length === 0) return "";
        let html = `<table class="table-output w-full mb-4">
            <thead><tr><th>क्र.सं.</th><th>निवेदकको नाम</th><th>${h1}</th><th>${h2}</th><th>स्थायी ठेगाना</th></tr></thead><tbody>`;
        apps.forEach(a => {
            html += `<tr><td>${toNepaliDigits(snCount++)}</td><td><b>${a.name}</b></td><td>${a.f}</td><td>${a.gf}</td><td>${a.addr}, ${a.dist}</td></tr>`;
        });
        return html + `</tbody></table>`;
    }

    tableHtml += generateSubTable(fatherRelApps, "बाबुको नाम", "बाजेको नाम");
    tableHtml += generateSubTable(husbandRelApps, "पतिको नाम", "ससुराको नाम");
    document.getElementById('applicant_table_area').innerHTML = tableHtml;
}