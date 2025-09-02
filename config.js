// GitHub API 配置文件
// 注意：此文件不应提交到Git仓库
// 请在.gitignore中添加 config.js

window.GITHUB_API_CONFIG = {
    baseUrl: 'https://api.github.com',
    username: 'MyLoveSong',
    perPage: 50,
    // 请在此处填入您的新Token
    token: '', // 替换为您的新Token
    useAuth: true,
    maxRetries: 3,
    retryDelay: 2000,
    cacheEnabled: true,
    cacheDuration: 30 * 60 * 1000
};

console.log('🔧 GitHub API配置已加载');
