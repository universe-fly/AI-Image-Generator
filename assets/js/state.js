// --- Global State & DOM Elements ---

// Configuration & State
const apiUrlInput = document.getElementById('apiUrl');
const apiKeyInput = document.getElementById('apiKey');
const modelNameInput = document.getElementById('modelName');
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
const loadingSpinner = document.getElementById('loadingSpinner');
const statusMsg = document.getElementById('statusMsg');
const errorArea = document.getElementById('errorArea');
const errorMsg = document.getElementById('errorMsg');
const outputGrid = document.getElementById('outputGrid');
const resultCount = document.getElementById('resultCount');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const configSection = document.getElementById('configSection');

// API Pool Elements
const apiProfileSelect = document.getElementById('apiProfileSelect');
const modelListContainer = document.getElementById('modelListContainer');
const modelList = document.getElementById('modelList');

// Image Input Elements
const imageInput = document.getElementById('imageInput');
const imagePreviewList = document.getElementById('imagePreviewList');
const dropZone = document.getElementById('dropZone');
const clearImagesContainer = document.getElementById('clearImagesContainer');

// Global Variables
let generatedImages = []; // Store base64 strings
let currentImages = []; // Store uploaded images { base64, name }
let db = null;
let apiProfiles = [];
