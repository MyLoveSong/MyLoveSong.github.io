# 🌐 CORS问题解决指南

## ❌ 当前问题
你遇到了CORS（跨域资源共享）错误：
```
Access to fetch at 'https://api.github.com/users/MyLoveSong/repos' from origin 'null' has been blocked by CORS policy
```

## 🔍 问题原因
1. **本地文件系统**: 直接在浏览器中打开HTML文件（`file://` 协议）
2. **跨域请求**: 从本地文件访问GitHub API
3. **请求头问题**: `Cache-Control` 等头部不被GitHub API允许

## ✅ 解决方案

### 方案1：使用本地服务器（强烈推荐）

#### 方法1：使用启动脚本
1. 双击运行 `start-server.bat`
2. 在浏览器中访问 `http://localhost:8000`
3. 而不是直接打开HTML文件

#### 方法2：手动启动服务器
```bash
# 使用Python
python -m http.server 8000

# 使用Python3
python3 -m http.server 8000

# 使用Node.js
npx http-server -p 8000 -o
```

#### 方法3：使用VS Code扩展
1. 安装 "Live Server" 扩展
2. 右键HTML文件 → "Open with Live Server"

### 方案2：修复请求头问题

已修复项目管理器中的请求头：
- 移除了 `Cache-Control: no-cache`
- 移除了 `User-Agent` 自定义头部
- 保留必要的 `Accept` 头部

### 方案3：使用代理服务器

如果上述方法都不行，可以使用代理：

```javascript
// 使用CORS代理
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = `${proxyUrl}https://api.github.com/users/MyLoveSong/repos`;
```

## 🚀 立即行动

### 步骤1：启动本地服务器
```bash
# 在项目目录中运行
cd "唱片公司2.0/唱片公司"
start-server.bat
```

### 步骤2：访问正确的URL
- ❌ 错误: `file:///D:/ShortTerm/唱片公司2.0/唱片公司/index.html`
- ✅ 正确: `http://localhost:8000/index.html`

### 步骤3：测试GitHub API
访问 `http://localhost:8000/test-github-api.html`

## 📊 预期结果

使用本地服务器后：
- ✅ 无CORS错误
- ✅ GitHub API正常调用
- ✅ 项目列表正常显示
- ✅ 认证Token正常工作

## 🔧 故障排除

### 如果仍有CORS错误
1. **确认使用HTTP协议**: 确保URL以 `http://` 开头
2. **检查端口**: 确保使用正确的端口号（8000）
3. **清除缓存**: 清除浏览器缓存和Cookie
4. **检查防火墙**: 确保端口8000未被阻止

### 如果服务器启动失败
1. **检查Python/Node.js**: 确保已正确安装
2. **检查端口占用**: 确保8000端口未被占用
3. **尝试其他端口**: 修改脚本使用其他端口（如8080、3000）

## 💡 最佳实践

1. **开发环境**: 始终使用本地服务器，不要直接打开HTML文件
2. **生产环境**: 使用HTTPS和正确的CORS配置
3. **API调用**: 简化请求头，只保留必要的头部
4. **错误处理**: 实现优雅的降级和重试机制

## 📞 技术支持

如果按照以上步骤仍无法解决问题：
1. 检查浏览器控制台完整错误信息
2. 确认网络环境（公司网络可能有额外限制）
3. 尝试使用不同的浏览器
4. 检查是否有代理或VPN影响

---

**重要提醒**: CORS是浏览器的安全机制，在本地开发时必须使用HTTP服务器，不能直接打开HTML文件。
