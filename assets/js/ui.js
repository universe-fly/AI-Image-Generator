// --- UI Functions ---

function toggleConfig() {
    configSection.classList.toggle('hidden');
}

function updateStatus(msg, isError = false) {
    statusMsg.innerText = msg;
    statusMsg.className = isError ? "text-xs text-center text-red-500 h-4" : "text-xs text-center text-gray-500 h-4";
}

function showError(msg) {
    errorArea.classList.remove('hidden');
    errorMsg.innerText = msg;
    updateStatus("发生错误", true);
}

function clearError() {
    errorArea.classList.add('hidden');
    errorMsg.innerText = '';
}

function setLoading(isLoading) {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-75', 'cursor-not-allowed');
        btnText.innerText = "生成中...";
        loadingSpinner.classList.remove('hidden');
        promptInput.disabled = true;
    } else {
        generateBtn.disabled = false;
        generateBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        btnText.innerText = "生成图片";
        loadingSpinner.classList.add('hidden');
        promptInput.disabled = false;
    }
}

// --- Image Input Logic ---
function handleImageUpload(input) {
    processFiles(input.files);
    input.value = ''; // Reset input to allow re-uploading same files
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('bg-blue-50', 'border-blue-400');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('bg-blue-50', 'border-blue-400');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('bg-blue-50', 'border-blue-400');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFiles(files);
    }
}

function processFiles(files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        if (file.size > 5 * 1024 * 1024) {
            alert(`图片 ${file.name} 大小超过 5MB，已跳过`);
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            currentImages.push({
                base64: e.target.result,
                name: file.name
            });
            renderImagePreviews();
        };
        reader.readAsDataURL(file);
    });
}

function renderImagePreviews() {
    imagePreviewList.innerHTML = '';
    
    if (currentImages.length === 0) {
        clearImagesContainer.classList.add('hidden');
        return;
    }

    clearImagesContainer.classList.remove('hidden');

    currentImages.forEach((imgData, index) => {
        const div = document.createElement('div');
        div.className = 'relative w-20 h-20 border rounded overflow-hidden group';
        
        const img = document.createElement('img');
        img.src = imgData.base64;
        img.className = 'w-full h-full object-cover';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = () => removeImage(index);

        div.appendChild(img);
        div.appendChild(removeBtn);
        imagePreviewList.appendChild(div);
    });
}

function removeImage(index) {
    currentImages.splice(index, 1);
    renderImagePreviews();
}

function clearAllImages() {
    currentImages = [];
    renderImagePreviews();
}

function clearHistory() {
    if(confirm('确定要清空所有历史记录吗？')) {
        clearHistoryDB();
    }
}

// --- Image Rendering & Download ---

function renderImages() {
    if (generatedImages.length === 0) {
        outputGrid.innerHTML = `
            <div class="col-span-full text-center text-gray-400 py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <svg class="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p>等待生成...</p>
            </div>
        `;
        resultCount.innerText = '(0)';
        downloadAllBtn.classList.add('hidden');
        return;
    }

    outputGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    generatedImages.forEach((base64Str, index) => {
        // Reverse index for display (newest is #1)
        const displayIndex = generatedImages.length - index;
        const card = createImageCard(base64Str, displayIndex);
        fragment.appendChild(card);
    });

    outputGrid.appendChild(fragment);
    resultCount.innerText = `(${generatedImages.length})`;
    downloadAllBtn.classList.remove('hidden');
}

function createImageCard(base64Str, index) {
    const div = document.createElement('div');
    div.className = 'bg-gray-50 rounded border border-gray-200 p-2 flex flex-col gap-2 group hover:shadow-lg transition duration-200';
    
    // Image Container
    const imgContainer = document.createElement('div');
    imgContainer.className = 'relative h-64 bg-gray-200 rounded overflow-hidden flex items-center justify-center bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZWVlIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+")]';
    
    const img = document.createElement('img');
    img.src = base64Str;
    img.className = 'max-w-full max-h-full object-contain';
    img.alt = `Generated Image ${index}`;
    
    // Overlay for size info
    const infoOverlay = document.createElement('div');
    infoOverlay.className = 'absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition duration-200 truncate';
    // Calculate approx size in KB
    const sizeInBytes = 4 * Math.ceil((base64Str.length / 3)) * 0.5624896334383812;
    const sizeInKb = (sizeInBytes / 1024).toFixed(1);
    infoOverlay.innerText = `${sizeInKb} KB`;

    imgContainer.appendChild(img);
    imgContainer.appendChild(infoOverlay);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'flex justify-between items-center mt-1';
    
    const title = document.createElement('span');
    title.className = 'text-xs text-gray-500 font-mono';
    title.innerText = `IMG_${index}`;

    const downloadBtn = document.createElement('a');
    downloadBtn.href = base64Str;
    downloadBtn.download = `ai_image_${Date.now()}_${index}.png`; 
    downloadBtn.className = 'text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-blue-50 text-blue-600 cursor-pointer';
    downloadBtn.innerText = '下载';

    actions.appendChild(title);
    actions.appendChild(downloadBtn);

    div.appendChild(imgContainer);
    div.appendChild(actions);

    return div;
}

function downloadAll() {
    const links = outputGrid.querySelectorAll('a[download]');
    if (links.length === 0) return;
    
    let delay = 0;
    links.forEach(link => {
        setTimeout(() => {
            link.click();
        }, delay);
        delay += 300; 
    });
}