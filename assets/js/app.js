// --- Initialization ---

window.addEventListener('DOMContentLoaded', async () => {
    loadConfig();
    await initDB();
    await loadHistory();
});