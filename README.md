# 🎵 音乐盛宴网站

一个展示音乐创作和艺术作品的个人网站，包含项目展示、技能可视化和交互式地图等功能。

## ✨ 功能特色

- 🎨 现代化响应式设计
- 📱 移动端友好
- 🌙 深色/浅色主题切换
- 🗺️ 交互式地图
- 📊 技能可视化
- 📝 博客系统
- 🎵 音乐播放器
- 📈 项目展示

## 🚀 快速开始

### 方法1：直接使用（推荐）

1. 下载或克隆此仓库
2. 用浏览器打开 `index.html`
3. 享受音乐盛宴！

### 方法2：本地服务器

```bash
# 使用Python启动本地服务器
python -m http.server 8080

# 或使用Node.js
npx serve .

# 然后访问 http://localhost:8080
```

## ⚙️ GitHub API 配置（可选）

如果您想要获得更高的API限流（从60次/小时提升到5000次/小时），可以配置GitHub Personal Access Token：

### 步骤1：创建Token

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 设置Token名称：`音乐网站API访问`
4. 选择权限：
   - ✅ `public_repo` (读取公开仓库)
   - ✅ `read:user` (读取用户信息)
5. 设置过期时间：建议90天
6. 点击 "Generate token"
7. **立即复制Token**（只显示一次）

### 步骤2：配置Token

**方法1：修改配置文件**
```javascript
// 在 js/project-manager.js 中修改
window.GITHUB_API_CONFIG = {
    baseUrl: 'https://api.github.com',
    username: 'MyLoveSong',
    perPage: 50,
    token: '', // 请在此处填入您的GitHub Personal Access Token
    useAuth: true, // 改为true启用认证
    maxRetries: 3,
    retryDelay: 2000,
    cacheEnabled: true,
    cacheDuration: 30 * 60 * 1000
};
```

**方法2：使用环境变量**
```bash
# 设置环境变量
export GITHUB_TOKEN=YOUR_TOKEN_HERE
```

### 步骤3：测试配置

打开 `test-github-api-fixed.html` 测试您的配置。

## 🔒 安全提醒

- **不要**将Token提交到公开仓库
- **不要**分享您的Token
- **定期更新**Token（建议90天）
- 使用最小必要权限

## 📊 API限流对比

| 认证状态 | 每小时限制 | 说明 |
|---------|-----------|------|
| 未认证 | 60次 | 默认状态，适合偶尔使用 |
| 已认证 | 5000次 | 使用Token后的状态，适合频繁使用 |

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: CSS Grid, Flexbox, CSS Variables
- **动画**: CSS Animations, Transitions
- **API**: GitHub REST API
- **地图**: Leaflet.js
- **图表**: Chart.js

## 📁 项目结构

```
├── index.html              # 主页面
├── css/                    # 样式文件
│   ├── main.css           # 主样式
│   ├── dark-mode.css      # 深色主题
│   └── ...
├── js/                     # JavaScript文件
│   ├── project-manager.js # 项目数据管理
│   ├── theme-manager.js   # 主题管理
│   └── ...
├── images/                 # 图片资源
├── posts/                  # 博客文章
└── README.md              # 项目说明
```

## 🎯 功能模块

- **ProjectManager**: 项目数据管理和GitHub API集成
- **ThemeManager**: 主题切换和样式管理
- **MapManager**: 交互式地图功能
- **BlogSystem**: 博客文章管理
- **SkillVisualizer**: 技能可视化
- **UIEffectsManager**: 用户界面效果

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 联系

- GitHub: [MyLoveSong](https://github.com/MyLoveSong)
- 邮箱: [您的邮箱]

---

**享受音乐盛宴！** 🎵✨