// File: /tippani/common/letterhead.js

const COMMON_LOGO_BASE64 = 
"data:image/jpeg;base64,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"
;
const CommonHeader = {
    // 1. Unified CSS to match Namsari exactly
    getCSS: function() {
        return `
        <style>
            .common-office-header { 
                display: flex; 
                align-items: center; 
                border-bottom: 2px double black; 
                margin-bottom: 15px; 
                padding-bottom: 10px;
                width: 100%;
            }
            .common-header-logo { width: 90px; text-align: left; }
            .common-header-text { 
                flex-grow: 1; 
                text-align: center; 
                line-height: 1.2; 
                color: #ff0000; /* Red as per Namsari */
            }
            .common-gov { font-size: 10pt; font-weight: bold; }
            .common-ministry { font-size: 11pt; font-weight: bold; }
            .common-dept { font-size: 12pt; font-weight: bold; }
            .common-office { font-size: 16pt; font-weight: bold; }
            .common-addr { font-size: 11pt; font-weight: bold; }
            .common-header-right { width: 90px; } /* Spacer to keep text centered */
        </style>`;
    },

    // 2. Function to generate and inject the header
    render: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Fetch settings exactly like the Senior Dev's Namsari tool
        const settings = JSON.parse(localStorage.getItem('global_office_settings')) || { 
            gov: "नेपाल सरकार", 
            ministry: "भूमि व्यवस्था, सहकारी, संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय", 
            dept: "भूमि व्यवस्थापन तथा अभिलेख विभाग", 
            office: "भूमि प्रशासन कार्यालय", 
            addr: "चौतारा, सिन्धुपाल्चोक", 
            def_dist: "सिन्धुपाल्चोक" 
        };

        const html = `
            ${this.getCSS()}
            <div class="common-office-header">
                <div class="common-header-logo">
                    <img src="${COMMON_LOGO_BASE64}" style="width:90px;">
                </div>
                <div class="common-header-text">
                    <div class="common-gov">${settings.gov}</div>
                    <div class="common-ministry">${settings.ministry}</div>
                    <div class="common-dept">${settings.dept}</div>
                    <div class="common-office">${settings.office}</div>
                    <div class="common-addr">${settings.addr}</div>
                </div>
                <div class="common-header-right"></div>
            </div>
        `;
        container.innerHTML = html;

        // Update any other elements with .global-dist class (like in Namsari)
        document.querySelectorAll('.global-dist').forEach(el => {
            el.innerText = settings.def_dist || "सिन्धुपाल्चोक";
        });
    }
};