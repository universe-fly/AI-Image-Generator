// --- Core Logic ---

async function generateImage() {
    const url = apiUrlInput.value.trim();
    const key = apiKeyInput.value.trim();
    const model = modelNameInput.value.trim();
    const prompt = promptInput.value.trim();

    if (!url || !key || !model) {
        alert("请先完成 API 配置 (URL, Key, Model)");
        return;
    }
    if (!prompt && currentImages.length === 0) {
        alert("请输入生图要求或上传参考图");
        return;
    }

    // Save config on generate
    saveConfig();

    clearError();
    setLoading(true);
    updateStatus("正在请求 AI...");

    try {
        let messages = [];
        
        // Construct message based on input type (Text-only or Vision)
        if (currentImages.length > 0) {
            // Vision Request (Multi-image support)
            const userContent = [
                { type: "text", text: `Generate an image based on this description: ${prompt || "Generate an image based on the provided images."}` }
            ];

            // Add all images
            currentImages.forEach(img => {
                userContent.push({
                    type: "image_url",
                    image_url: { url: img.base64 }
                });
            });

            messages = [
                {
                    role: "system",
                    content: "You are an advanced AI image generator. The user will provide a description and possibly images. You must generate an image and return ONLY the Base64 encoded string of the image. The string must start with 'data:image/png;base64,' (or jpeg/webp). Do not output any markdown, code blocks, or conversational text. Just the raw Base64 string."
                },
                {
                    role: "user",
                    content: userContent
                }
            ];
        } else {
            // Text-only Request
            messages = [
                {
                    role: "system",
                    content: "You are an advanced AI image generator. The user will provide a description. You must generate an image and return ONLY the Base64 encoded string of the image. The string must start with 'data:image/png;base64,' (or jpeg/webp). Do not output any markdown, code blocks, or conversational text. Just the raw Base64 string."
                },
                {
                    role: "user",
                    content: `Generate an image based on this description: ${prompt}`
                }
            ];
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 4096 // Ensure enough tokens for image generation
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API 请求失败: ${response.status} - ${errText}`);
        }

        updateStatus("正在解析响应...");
        const data = await response.json();
        
        if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
            throw new Error("API 返回格式不符合预期 (缺少 choices/message)");
        }

        let content = data.choices[0].message.content.trim();

        // Regex extraction logic
        const base64Match = content.match(/(data:image\/[a-zA-Z+.-]+;base64,[a-zA-Z0-9+/=]+)/);

        if (base64Match) {
            content = base64Match[1];
        } else {
            let rawContent = content.replace(/^```(base64|text|json)?\s*/i, '').replace(/\s*```$/, '').trim();
            if (/^[A-Za-z0-9+/=]+$/.test(rawContent) && rawContent.length > 20) {
                 content = 'data:image/png;base64,' + rawContent;
            } else {
                 throw new Error("AI 返回的内容中未找到有效的 Base64 图片数据。返回摘要: " + content.substring(0, 100) + "...");
            }
        }

        // Save to DB and update UI
        await saveToHistory(content);
        
        // Reload from DB to ensure sync
        await loadHistory();
        
        updateStatus("生成成功！");

    } catch (e) {
        console.error(e);
        showError(e.message);
    } finally {
        setLoading(false);
    }
}

// --- Fetch Models Logic ---
async function fetchModels() {
    const url = apiUrlInput.value.trim();
    const key = apiKeyInput.value.trim();

    if (!url || !key) {
        alert("请先填写 API URL 和 Key");
        return;
    }

    // Try to deduce models endpoint
    let modelsUrl = url;
    if (modelsUrl.endsWith('/chat/completions')) {
        modelsUrl = modelsUrl.replace('/chat/completions', '/models');
    } else if (modelsUrl.endsWith('/v1')) {
        modelsUrl = modelsUrl + '/models';
    } else {
        if (!modelsUrl.includes('/models')) {
             modelsUrl = modelsUrl.replace(/\/chat\/completions\/?$/, '/models');
        }
    }

    updateStatus("正在拉取模型列表...");
    modelListContainer.classList.add('hidden');
    modelList.innerHTML = '';

    try {
        const response = await fetch(modelsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${key}`
            }
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        const data = await response.json();
        const models = data.data || data.models || []; 

        if (!Array.isArray(models) || models.length === 0) {
            throw new Error("未找到模型数据");
        }

        // Sort models by id
        models.sort((a, b) => a.id.localeCompare(b.id));

        models.forEach(m => {
            const div = document.createElement('div');
            div.className = 'p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-sm';
            div.innerText = m.id;
            div.onclick = () => {
                modelNameInput.value = m.id;
                modelListContainer.classList.add('hidden');
            };
            modelList.appendChild(div);
        });

        modelListContainer.classList.remove('hidden');
        updateStatus(`成功获取 ${models.length} 个模型`);

    } catch (e) {
        console.error(e);
        alert(`拉取模型失败: ${e.message}\n尝试的URL: ${modelsUrl}`);
        updateStatus("拉取模型失败", true);
    }
}