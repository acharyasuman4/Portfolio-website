// This function runs in the background
async function silentUpdateCheck() {
    // 1. Check if we have internet at all
    if (!navigator.onLine) return; 

    try {
        const { check } = window.__TAURI__.updater;
        const { relaunch } = window.__TAURI__.app;

        // 2. Look for update (this happens in background)
        const update = await check();
        
        if (update && update.available) {
            // 3. Update found! Create a small notification or use confirm
            console.log("Update available: " + update.version);
            
            const shouldUpdate = confirm("A new update is available. Download and restart now?");
            if (shouldUpdate) {
                await update.downloadAndInstall();
                await relaunch();
            }
        }
    } catch (err) {
        // If internet is blocked or slow, this error is caught 
        // and the app keeps working perfectly.
        console.log("Update check timed out or failed. User is offline.");
    }
}

// STRATEGY: Wait 10 seconds after the app is open to check for updates.
// This ensures the user has zero lag when they start the app.
setTimeout(silentUpdateCheck, 10000);

async function checkUpdate() {
    try {
        const { check } = window.__TAURI__.updater;
        const { relaunch } = window.__TAURI__.process; // Use .process in v2

        const update = await check();
        if (update && update.available) {
            if (confirm("Update available! Restart now?")) {
                await update.downloadAndInstall();
                await relaunch(); // This uses the permission we just added
            }
        }
    } catch (e) {
        console.log("Check failed", e);
    }
}