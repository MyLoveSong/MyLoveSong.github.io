# 🔐 GitHub API 配置指南

## 🚨 重要安全提醒

**⚠️ 安全第一！** 本指南适用于公开仓库的安全配置。

## 📋 配置要求

### 任务 2.1：动态渲染与组件化
- **功能**： 使用 GitHub API 获取你的所有公开仓库，并动态生成项目卡片展示仓库信息（名称、描述、编程语言标签）。

### 任务 2.2：项目智能筛选系统
- **功能**： 实现基于编程语言的智能筛选功能，用户可以点击语言标签筛选显示对应语言的项目。

## 🔧 配置步骤

### 步骤1：创建Personal Access Token（可选）

**注意**：对于公开仓库展示，可以不使用Token，但使用Token可以获得更高的API限流。

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 设置Token名称：`音乐网站API访问`
4. 选择权限：
   - ✅ `public_repo` (读取公开仓库)
   - ✅ `read:user` (读取用户信息)
5. 设置过期时间：建议选择90天或更长
6. 点击 "Generate token"
7. **重要**：立即复制生成的Token（只显示一次）

### 步骤2：安全配置Token

**方法1：使用本地配置文件（推荐）**
```javascript
// 创建 config.js 文件（不要提交到Git）
window.LOCAL_GITHUB_API_CONFIG = {
    token: 'YOUR_TOKEN_HERE', // 在此处填入您的Token
    useAuth: true
};
```

**方法2：直接修改主配置**
```javascript
// 在 js/project-manager.js 中修改
window.GITHUB_API_CONFIG = {
    baseUrl: 'https://api.github.com',
    username: 'MyLoveSong',
    perPage: 50,
    token: '', // 请在此处填入您的GitHub Personal Access Token
    useAuth: false, // 默认关闭认证，避免401错误
    maxRetries: 3,
    retryDelay: 2000,
    cacheEnabled: true,
    cacheDuration: 30 * 60 * 1000
};
```

### 步骤3：验证配置

使用测试文件验证配置：
- `test-api-quick.html` - 快速API测试
- `test-github-api-fixed.html` - 完整API测试

## 🔒 安全配置（公开仓库）

### 默认安全配置
```javascript
const GITHUB_API_CONFIG = {
    baseUrl: 'https://api.github.com',
    username: 'MyLoveSong',
    perPage: 50,
    token: '', // 空Token，使用未认证模式
    useAuth: false, // 关闭认证，避免401错误
    maxRetries: 3,
    retryDelay: 2000,
    cacheEnabled: true,
    cacheDuration: 30 * 60 * 1000
};
```

### 启用认证（可选）
如果您有Token并想获得更高限流：
```javascript
// 在 config.js 中配置
window.LOCAL_GITHUB_API_CONFIG = {
    token: 'YOUR_TOKEN_HERE',
    useAuth: true
};
```

## 📊 限流对比
| 认证状态 | 每小时限制 | 说明 |
|---------|-----------|------|
| 未认证 | 60次 | 适合公开仓库展示 |
| 已认证 | 5000次 | 适合频繁访问 |

## 🚀 立即使用

1. **公开仓库展示**：直接使用默认配置
2. **个人使用**：配置Token获得更高限流
3. **测试验证**：使用测试文件确认功能正常

## 🧪 测试文件

- `test-api-quick.html` - 快速验证
- `test-github-api-fixed.html` - 完整测试

## 📞 需要帮助？

如果遇到问题，请检查：
- 网络连接是否正常
- 用户名是否正确
- 浏览器控制台错误信息

## 🔄 最佳实践

- ✅ 使用未认证模式展示公开仓库
- ✅ 使用本地配置文件存储Token
- ✅ 定期更新Token
- ✅ 不要将Token提交到公开仓库
