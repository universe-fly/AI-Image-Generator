// --- IndexedDB Setup ---
const DB_NAME = 'AI_Image_Gen_DB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject("Could not open database");
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("IndexedDB opened successfully");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
        };
    });
}

async function saveToHistory(base64Str) {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const item = {
        content: base64Str,
        timestamp: Date.now()
    };
    store.add(item);
}

async function loadHistory() {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
        // Sort by timestamp descending (newest first)
        const items = request.result.sort((a, b) => b.timestamp - a.timestamp);
        generatedImages = items.map(item => item.content);
        renderImages();
    };
}

async function clearHistoryDB() {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    generatedImages = [];
    renderImages();
}

// --- API Profiles Logic ---
function loadProfiles() {
    const stored = localStorage.getItem('ai_gen_profiles');
    if (stored) {
        try {
            apiProfiles = JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse profiles", e);
            apiProfiles = [];
        }
    }
    renderProfileSelect();
}

function saveProfiles() {
    localStorage.setItem('ai_gen_profiles', JSON.stringify(apiProfiles));
    renderProfileSelect();
}

function renderProfileSelect() {
    // Keep the first option (placeholder)
    apiProfileSelect.innerHTML = '<option value="">-- 未保存的临时配置 --</option>';
    
    apiProfiles.forEach((profile, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = profile.name || `配置 ${index + 1}`;
        apiProfileSelect.appendChild(option);
    });
}

function createNewProfile() {
    apiUrlInput.value = '';
    apiKeyInput.value = '';
    modelNameInput.value = '';
    apiProfileSelect.value = "";
    alert("已清空输入框，请输入新配置后点击'保存当前配置'");
}

function saveCurrentProfile() {
    const url = apiUrlInput.value.trim();
    const key = apiKeyInput.value.trim();
    const model = modelNameInput.value.trim();

    if (!url) {
        alert("API URL 不能为空");
        return;
    }

    const name = prompt("请输入此配置的名称:", `配置 ${apiProfiles.length + 1}`);
    if (name === null) return; // Cancelled

    const newProfile = { name, url, key, model };
    
    // Check if we are updating an existing selected profile
    if (apiProfileSelect.value !== "") {
        if(confirm("要覆盖当前选中的配置吗？\n点击[确定]覆盖，点击[取消]另存为新配置")) {
            apiProfiles[apiProfileSelect.value] = newProfile;
        } else {
            apiProfiles.push(newProfile);
        }
    } else {
        apiProfiles.push(newProfile);
    }

    saveProfiles();
    // Select the newly added/updated profile
    if (apiProfileSelect.value === "") {
        apiProfileSelect.value = apiProfiles.length - 1;
    }
    alert("配置已保存");
}

function deleteCurrentProfile() {
    const index = apiProfileSelect.value;
    if (index === "") {
        alert("无法删除临时配置");
        return;
    }
    
    if (confirm(`确定要删除配置 "${apiProfiles[index].name}" 吗？`)) {
        apiProfiles.splice(index, 1);
        saveProfiles();
        createNewProfile(); // Reset inputs
    }
}

function loadProfile(index) {
    if (index === "") return; 
    
    const profile = apiProfiles[index];
    if (profile) {
        apiUrlInput.value = profile.url || '';
        apiKeyInput.value = profile.key || '';
        modelNameInput.value = profile.model || '';
    }
}

// --- LocalStorage Config (Legacy + Current) ---
function saveConfig() {
    localStorage.setItem('ai_gen_apiUrl', apiUrlInput.value);
    localStorage.setItem('ai_gen_apiKey', apiKeyInput.value);
    localStorage.setItem('ai_gen_modelName', modelNameInput.value);
}

function loadConfig() {
    // Load profiles first
    loadProfiles();

    // Load last used values
    const url = localStorage.getItem('ai_gen_apiUrl');
    const key = localStorage.getItem('ai_gen_apiKey');
    const model = localStorage.getItem('ai_gen_modelName');
    
    if (url) apiUrlInput.value = url;
    if (key) apiKeyInput.value = key;
    if (model) modelNameInput.value = model;
}