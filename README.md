# AI 生图工具 (AI Image Generator)

一个基于 Web 的 AI 图像生成工具，支持 OpenAI / Gemini 格式的 API 接口。输入提示词（可附带参考图），AI 返回 Base64 编码并自动转换为图片。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ 功能特性

- 🎨 **AI 图像生成** - 通过自然语言描述生成图像
- 🖼️ **多图上传** - 支持上传多张参考图片，实现 Vision 多模态输入
- 📂 **拖拽上传** - 支持拖拽图片到上传区域
- 🔑 **API 配置池** - 保存和管理多个 API 配置，快速切换
- 📋 **模型列表** - 一键拉取 API 支持的可用模型列表
- 💾 **历史记录** - 使用 IndexedDB 本地保存生成历史
- 📥 **批量下载** - 一键下载所有生成的图片
- 📱 **响应式设计** - 适配桌面端和移动端

## 📁 项目结构

```
base64 to image tool/
├── index.html              # 主入口文件
├── README.md               # 项目说明文档
└── assets/
    ├── css/
    │   └── style.css       # 自定义样式
    └── js/
        ├── state.js        # 全局状态管理
        ├── storage.js      # 数据存储 (IndexedDB / LocalStorage)
        ├── ui.js           # UI 交互逻辑
        ├── api.js          # API 请求处理
        └── app.js          # 应用初始化
```

## 🚀 快速开始

### 1. 直接使用

由于本项目是纯前端项目，无需任何构建工具，直接在浏览器中打开 `index.html` 即可使用。

```bash
# 克隆项目
git clone <repository-url>

# 进入目录
cd "base64 to image tool"

# 直接打开 index.html 或使用本地服务器
# 方式一：直接双击 index.html
# 方式二：使用 VS Code Live Server 扩展
# 方式三：使用 Python 简易服务器
python -m http.server 8080
```

### 2. 配置 API

1. 打开页面后，在 **API 配置** 区域填写：
   - **API URL**: 你的 API 端点地址 (如 `https://api.openai.com/v1/chat/completions`)
   - **API Key**: 你的 API 密钥
   - **Model Name**: 模型名称 (如 `gpt-4o`, `gemini-pro-vision`)

2. 点击 **保存当前配置** 可以将配置保存到配置池中，方便下次快速切换。

### 3. 生成图片

1. 在左侧文本框输入你的图片描述 (Prompt)
2. (可选) 点击上传区域或拖拽图片添加参考图
3. 点击 **生成图片** 按钮
4. 等待 AI 返回结果，图片将自动显示在右侧区域

## 🔧 API 兼容性

本工具兼容 OpenAI Chat Completions API 格式，支持以下类型的 API：

| API 类型 | 支持状态 | 说明 |
|---------|---------|------|
| OpenAI API | ✅ | 官方 API |
| Azure OpenAI | ✅ | 需使用 Azure 端点 |
| Gemini API | ✅ | 通过 OpenAI 兼容格式 |
| 其他兼容 API | ✅ | 任何兼容 OpenAI 格式的 API |

### 请求格式示例

```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "你的提示词" },
        { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." } }
      ]
    }
  ]
}
```

## 💡 使用技巧

1. **提示词技巧**: 尽量详细描述你想要的图片，包括风格、颜色、构图等
2. **参考图**: 上传参考图可以帮助 AI 更好地理解你的需求
3. **配置池**: 如果你有多个 API Key 或使用多个服务商，可以保存多个配置快速切换
4. **模型选择**: 点击模型输入框旁的刷新按钮可以拉取可用模型列表

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **TailwindCSS** (CDN) - 样式框架
- **Vanilla JavaScript** - 无框架依赖
- **IndexedDB** - 本地历史记录存储
- **LocalStorage** - API 配置存储
- **File API** - 图片上传处理

## 📝 注意事项

- 请确保所选模型支持返回 Base64 格式的图片数据
- 若使用图片输入功能，请确保模型支持 Vision (多模态)
- API Key 等敏感信息仅存储在本地浏览器中，不会上传到任何服务器
- 建议使用现代浏览器 (Chrome, Firefox, Edge) 以获得最佳体验

## 📄 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

Made with ❤️ for AI Image Generation
