// File: /tippani/common/vdc_helper.js

const VDCManager = {
    db: null,

    // 1. Fetch and load the Valuation JSON
    init: async function(inputId, datalistId) {
        try {
            // Fetching the same JSON used in Namsari
            const res = await fetch('/registration/land_valuation_final.json');
            this.db = await res.json();
            this.populate(datalistId);
            this.setupTabAutocomplete(inputId, datalistId);
        } catch (e) {
            console.error("VDC Data load failed:", e);
        }
    },

    // 2. Filter VDCs by Default District and populate datalist
    populate: function(datalistId) {
        if (!this.db) return;

        // Get the default district from global settings (Exactly like Namsari)
        const settings = JSON.parse(localStorage.getItem('global_office_settings')) || { def_dist: "सिन्धुपाल्चोक" };
        const targetDistrict = settings.def_dist;

        let vdcSet = new Set();

        // Loop through districts to find the match
        this.db.districts.forEach(d => {
            if (d.name === targetDistrict) { // Only take VDCs from the default district
                d.locals.forEach(l => {
                    l.mapping.forEach(m => {
                        m.links.forEach(link => { 
                            if (link.vdc) vdcSet.add(link.vdc); 
                        });
                    });
                });
            }
        });

        const dl = document.getElementById(datalistId);
        if (dl) {
            dl.innerHTML = Array.from(vdcSet)
                .sort()
                .map(v => `<option value="${v}">`)
                .join('');
        }
    },

    // 3. Reusable Autocomplete Logic (The "Tab" feature from Namsari)
    setupTabAutocomplete: function(inputId, datalistId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.setAttribute('list', datalistId); // Link input to datalist

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const val = input.value.trim().toLowerCase();
                if (!val) return;
                
                const dl = document.getElementById(datalistId);
                const options = Array.from(dl.options).map(o => o.value);
                const matches = options.filter(o => o.toLowerCase().startsWith(val));
                
                if (matches.length === 1) {
                    input.value = matches[0];
                }
            }
        });
    }
};