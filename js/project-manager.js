// 项目数据管理类 - 面向对象编程

// 默认GitHub API配置（如果外部配置未加载）
if (typeof GITHUB_API_CONFIG === 'undefined') {
    window.GITHUB_API_CONFIG = {
        baseUrl: 'https://api.github.com',
        username: 'MyLoveSong',
        perPage: 50,
        // 注意：此配置适用于公开仓库
        // 用户需要自己配置Token来获得更高的API限流
        token: '', // 用户需要自己配置Token
        useAuth: false, // 默认关闭认证，避免401错误
        maxRetries: 3,
        retryDelay: 2000,
        cacheEnabled: true,
        cacheDuration: 30 * 60 * 1000
    };
    console.log('⚠️ 使用默认GitHub API配置（未认证模式）');
    console.log('💡 如需认证，请配置您的GitHub Personal Access Token');
}

class ProjectManager {
    constructor() {
        this.projects = [];
        this.languages = new Set();
        this.currentFilter = 'all';
        this.isLoading = false;
        
        // 缓存系统
        this.cache = {
            projects: null,
            lastFetch: null,
            cacheDuration: 30 * 60 * 1000 // 30分钟缓存
        };
        
        // 初始化时尝试从缓存加载
        this.loadFromCache();
    }

    // 缓存管理方法
    saveToCache(data) {
        try {
            const cacheData = {
                projects: data,
                timestamp: Date.now()
            };
            localStorage.setItem('github_projects_cache', JSON.stringify(cacheData));
            this.cache.projects = data;
            this.cache.lastFetch = Date.now();
            console.log('💾 项目数据已缓存到本地存储');
        } catch (error) {
            console.warn('⚠️ 缓存保存失败:', error);
        }
    }

    loadFromCache() {
        try {
            const cached = localStorage.getItem('github_projects_cache');
            if (cached) {
                const cacheData = JSON.parse(cached);
                const now = Date.now();
                
                // 检查缓存是否过期
                if (now - cacheData.timestamp < this.cache.cacheDuration) {
                    this.projects = cacheData.projects;
                    this.languages = new Set(this.projects.map(p => p.language));
                    this.cache.projects = cacheData.projects;
                    this.cache.lastFetch = cacheData.timestamp;
                    
                    console.log('📦 从缓存加载项目数据:', this.projects.length, '个项目');
                    console.log('⏰ 缓存时间:', new Date(cacheData.timestamp).toLocaleString());
                    
                    // 渲染缓存的数据
                    this.renderProjects();
                    this.renderLanguageFilters();
                    this.animateProjectCards();
                    
                    return true;
                } else {
                    console.log('⏰ 缓存已过期，需要重新获取数据');
                    localStorage.removeItem('github_projects_cache');
                }
            }
        } catch (error) {
            console.warn('⚠️ 缓存加载失败:', error);
            localStorage.removeItem('github_projects_cache');
        }
        return false;
    }

    clearCache() {
        try {
            localStorage.removeItem('github_projects_cache');
            this.cache.projects = null;
            this.cache.lastFetch = null;
            console.log('🗑️ 缓存已清理');
        } catch (error) {
            console.warn('⚠️ 缓存清理失败:', error);
        }
    }

    // 强制刷新数据（忽略缓存）
    async refreshData() {
        console.log('🔄 强制刷新数据...');
        this.clearCache();
        await this.fetchProjects();
    }

    // 计算项目活跃度分数
    calculateActivityScore(repo) {
        let score = 0;
        
        // 基础分数
        score += repo.stargazers_count * 2; // 每个star 2分
        score += repo.forks_count * 3; // 每个fork 3分
        score += repo.watchers_count * 1; // 每个watcher 1分
        
        // 时间因子
        const now = new Date();
        const updated = new Date(repo.updated_at);
        const created = new Date(repo.created_at);
        
        // 最近更新加分
        const daysSinceUpdate = (now - updated) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 7) score += 10; // 一周内更新
        else if (daysSinceUpdate < 30) score += 5; // 一月内更新
        else if (daysSinceUpdate < 90) score += 2; // 三月内更新
        
        // 项目年龄加分（较新的项目）
        const daysSinceCreated = (now - created) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 365) score += 5; // 一年内的新项目
        
        // 项目大小加分（代码量）
        if (repo.size > 1000) score += 3; // 大项目
        else if (repo.size > 100) score += 1; // 中等项目
        
        // 功能完整性加分
        if (repo.has_pages) score += 2; // 有GitHub Pages
        if (repo.has_wiki) score += 1; // 有Wiki
        if (repo.has_issues) score += 1; // 有Issues
        if (repo.topics && repo.topics.length > 0) score += repo.topics.length; // 每个topic 1分
        
        // 许可证加分
        if (repo.license) score += 2;
        
        // 主页加分
        if (repo.homepage) score += 3;
        
        return Math.max(0, score); // 确保分数不为负数
    }

    // 表单提交（Formspree）
    setupContactForm() {
        const form = document.getElementById('contact-form');
        const statusEl = document.getElementById('form-status');
        if (!form || !statusEl) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '提交中...';
            }
            statusEl.textContent = '';

            const action = form.getAttribute('action') || '';
            if (action.includes('REPLACE_WITH_YOUR_FORM_ID')) {
                statusEl.textContent = '请先替换表单地址中的 Formspree 表单ID。';
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '提交'; }
                return;
            }

            try {
                const formData = new FormData(form);
                const response = await fetch(action, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });
                if (response.ok) {
                    statusEl.textContent = '提交成功！我会尽快联系你。';
                    form.reset();
                } else {
                    statusEl.textContent = '提交失败，请稍后重试。';
                }
            } catch (error) {
                statusEl.textContent = '网络错误，请检查网络连接。';
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '提交';
                }
            }
        });
    }

    // 从GitHub API获取项目数据
    async fetchProjects() {
        // 首先检查缓存
        if (this.loadFromCache()) {
            console.log('✅ 使用缓存数据，跳过API请求');
            return;
        }

        this.isLoading = true;
        this.showLoadingState();

        try {
            // 尝试多次请求，增加成功率
            const maxRetries = 3;
            let lastError;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`🔍 正在获取GitHub项目数据 (尝试 ${attempt}/${maxRetries}): ${GITHUB_API_CONFIG.username}`);
                    
                    // 构建请求头，支持认证（简化以避免CORS问题）
                    const headers = {
                        'Accept': 'application/vnd.github.v3+json'
                    };

                    // 如果配置了Personal Access Token，添加到请求头
                    if (GITHUB_API_CONFIG.token && GITHUB_API_CONFIG.useAuth) {
                        headers['Authorization'] = `token ${GITHUB_API_CONFIG.token}`;
                        console.log('🔐 使用GitHub认证进行API请求');
                    } else {
                        console.log('⚠️ 未使用GitHub认证，API限流较低');
                    }

                    // 构建API URL，添加更多参数以获取完整信息
                    const apiUrl = `${GITHUB_API_CONFIG.baseUrl}/users/${GITHUB_API_CONFIG.username}/repos?per_page=${GITHUB_API_CONFIG.perPage}&sort=updated&type=all&direction=desc`;
                    
                    console.log(`📡 请求URL: ${apiUrl}`);

                    const response = await fetch(apiUrl, {
                        method: 'GET',
                        headers: headers,
                        // 添加超时控制
                        signal: AbortSignal.timeout(10000) // 10秒超时
                    });

                    console.log(`📡 GitHub API响应状态: ${response.status} ${response.statusText}`);
                    console.log(`📡 响应头:`, Object.fromEntries(response.headers.entries()));

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`❌ API错误详情 (尝试 ${attempt}):`, errorText);
                        
                        if (response.status === 401) {
                            // 认证失败 - Token无效或过期
                            console.error('🔐 认证失败：GitHub Personal Access Token无效或已过期');
                            console.error('💡 解决方案：');
                            console.error('   1. 检查Token是否正确配置');
                            console.error('   2. 确认Token是否已过期');
                            console.error('   3. 验证Token权限是否足够（需要public_repo和read:user）');
                            console.error('   4. 重新生成Token');
                            throw new Error(`GitHub认证失败 (${response.status}): Token无效或已过期。请检查配置或重新生成Token。`);
                        } else if (response.status === 403) {
                            // 检查是否是限流
                            const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
                            const rateLimitReset = response.headers.get('X-RateLimit-Reset');
                            if (rateLimitRemaining === '0') {
                                const resetTime = new Date(parseInt(rateLimitReset) * 1000);
                                throw new Error(`API限流已达到，将在 ${resetTime.toLocaleString()} 重置`);
                            }
                            throw new Error(`API访问被拒绝 (${response.status})`);
                        } else if (response.status === 404) {
                            throw new Error(`用户 "${GITHUB_API_CONFIG.username}" 不存在 (${response.status})`);
                        } else if (response.status === 422) {
                            throw new Error(`请求参数无效 (${response.status})`);
                        } else if (response.status >= 500) {
                            throw new Error(`GitHub服务器错误 (${response.status})`);
                        } else {
                            throw new Error(`GitHub API 请求失败: ${response.status} ${response.statusText}`);
                        }
                    }

                    const repos = await response.json();
                    console.log(`📋 获取到 ${repos.length} 个仓库`);
                    
                    // 处理仓库数据，过滤掉fork的仓库（可选）
                    this.projects = repos
                        .filter(repo => {
                            // 过滤条件：只显示非fork的仓库，或者显示所有仓库
                            return !repo.fork || repo.stargazers_count > 0; // 显示fork但有star的仓库
                        })
                        .map(repo => ({
                            name: repo.name,
                            fullName: repo.full_name,
                            description: repo.description || '暂无描述',
                            language: repo.language || 'Other',
                            url: repo.html_url,
                            cloneUrl: repo.clone_url,
                            stars: repo.stargazers_count,
                            forks: repo.forks_count,
                            watchers: repo.watchers_count,
                            issues: repo.open_issues_count,
                            size: repo.size,
                            updated: repo.updated_at,
                            created: repo.created_at,
                            topics: repo.topics || [],
                            homepage: repo.homepage,
                            license: repo.license?.name || '无许可证',
                            archived: repo.archived,
                            fork: repo.fork,
                            private: repo.private,
                            readmeUrl: `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${repo.name}/main/README.md`,
                            // 添加更多有用信息
                            hasPages: repo.has_pages,
                            hasWiki: repo.has_wiki,
                            hasIssues: repo.has_issues,
                            hasProjects: repo.has_projects,
                            defaultBranch: repo.default_branch,
                            // 计算项目活跃度分数
                            activityScore: this.calculateActivityScore(repo)
                        }))
                        .sort((a, b) => {
                            // 按活跃度分数和更新时间排序
                            if (b.activityScore !== a.activityScore) {
                                return b.activityScore - a.activityScore;
                            }
                            return new Date(b.updated) - new Date(a.updated);
                        });

                                    // 如果成功获取数据，保存到缓存并跳出重试循环
                this.saveToCache(this.projects);
                break;
                    
                } catch (error) {
                    lastError = error;
                    console.error(`❌ 尝试 ${attempt} 失败:`, error.message);
                    
                    if (attempt < maxRetries) {
                        console.log(`⏳ 等待 ${attempt * 2} 秒后重试...`);
                        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
                    }
                }
            }

            // 如果所有重试都失败了
            if (!this.projects || this.projects.length === 0) {
                console.error('❌ 所有重试都失败了，使用备用项目数据');
                console.error('最后错误:', lastError);
                this.loadFallbackProjects();
            } else {
                // 成功获取数据后的处理
                this.languages = new Set(this.projects.map(p => p.language));
                
                // 调试信息：显示项目列表
                console.log('📋 获取到的GitHub项目:', this.projects.map(p => ({
                    name: p.name,
                    description: p.description,
                    language: p.language,
                    hasReadme: true // 所有项目都支持README
                })));
                
                console.log('✅ 成功获取GitHub项目数据');
                
                this.renderProjects();
                this.renderLanguageFilters();
                this.animateProjectCards();
            }
        } catch (error) {
            console.error('获取项目数据过程中发生未预期错误:', error);
            this.loadFallbackProjects();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    // 加载备用项目数据
    loadFallbackProjects() {
        console.log('📦 加载备用项目数据...');
        
        this.projects = [
            {
                name: '音乐盛宴网站',
                fullName: 'music-feast-website',
                description: '一个展示音乐创作和艺术作品的个人网站，包含项目展示、技能可视化和交互式地图等功能。',
                language: 'JavaScript',
                url: '#',
                cloneUrl: '#',
                stars: 15,
                forks: 3,
                watchers: 8,
                issues: 2,
                size: 2048,
                updated: new Date().toISOString(),
                created: '2024-01-15T00:00:00Z',
                topics: ['website', 'music', 'portfolio', 'javascript'],
                homepage: null,
                license: 'MIT',
                archived: false,
                fork: false,
                private: false,
                readmeUrl: '#'
            },
            {
                name: '音乐创作工具集',
                fullName: 'music-creation-tools',
                description: '一套用于音乐创作和制作的工具集合，包含节拍器、调音器和简单的音频编辑器。',
                language: 'Python',
                url: '#',
                cloneUrl: '#',
                stars: 8,
                forks: 2,
                watchers: 5,
                issues: 1,
                size: 1024,
                updated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                created: '2024-02-01T00:00:00Z',
                topics: ['music', 'tools', 'audio', 'python'],
                homepage: null,
                license: 'GPL-3.0',
                archived: false,
                fork: false,
                private: false,
                readmeUrl: '#'
            },
            {
                name: '数字音乐库',
                fullName: 'digital-music-library',
                description: '一个数字音乐库管理系统，支持音乐文件的分类、搜索和播放功能。',
                language: 'React',
                url: '#',
                cloneUrl: '#',
                stars: 12,
                forks: 4,
                watchers: 7,
                issues: 3,
                size: 1536,
                updated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                created: '2024-01-20T00:00:00Z',
                topics: ['react', 'music', 'library', 'management'],
                homepage: null,
                license: 'MIT',
                archived: false,
                fork: false,
                private: false,
                readmeUrl: '#'
            },
            {
                name: '音乐可视化器',
                fullName: 'music-visualizer',
                description: '基于Web Audio API的音乐可视化工具，能够实时显示音频频谱和波形。',
                language: 'JavaScript',
                url: '#',
                cloneUrl: '#',
                stars: 20,
                forks: 6,
                watchers: 12,
                issues: 4,
                size: 768,
                updated: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                created: '2024-01-10T00:00:00Z',
                topics: ['javascript', 'audio', 'visualization', 'web-audio'],
                homepage: null,
                license: 'MIT',
                archived: false,
                fork: false,
                private: false,
                readmeUrl: '#'
            },
            {
                name: '音乐节拍分析器',
                fullName: 'beat-analyzer',
                description: '使用机器学习算法分析音乐节拍和节奏的工具，支持多种音频格式。',
                language: 'Python',
                url: '#',
                cloneUrl: '#',
                stars: 25,
                forks: 8,
                watchers: 15,
                issues: 2,
                size: 3072,
                updated: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
                created: '2023-12-15T00:00:00Z',
                topics: ['python', 'machine-learning', 'audio', 'analysis'],
                homepage: null,
                license: 'Apache-2.0',
                archived: false,
                fork: false,
                private: false,
                readmeUrl: '#'
            },
            {
                name: '在线音乐协作平台',
                fullName: 'music-collaboration-platform',
                description: '一个支持多人在线协作创作音乐的平台，包含实时编辑和版本控制功能。',
                language: 'Vue.js',
                url: '#',
                cloneUrl: '#',
                stars: 18,
                forks: 5,
                watchers: 10,
                issues: 6,
                size: 4096,
                updated: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
                created: '2023-11-20T00:00:00Z',
                topics: ['vue', 'collaboration', 'music', 'real-time'],
                homepage: null,
                license: 'MIT',
                archived: false,
                fork: false,
                private: false,
                readmeUrl: '#'
            }
        ];

        this.languages = new Set(this.projects.map(p => p.language));
        
        console.log('✅ 备用项目数据加载完成:', this.projects.length, '个项目');
        
        this.renderProjects();
        this.renderLanguageFilters();
        this.animateProjectCards();
        
        // 显示备用数据提示
        this.showFallbackNotice();
    }

    // 显示备用数据提示
    showFallbackNotice() {
        const container = document.getElementById('projects-grid');
        if (!container) return;
        
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 600;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        notice.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span>⚠️</span>
                <span>使用备用项目数据</span>
            </div>
            <div style="font-size: 0.9rem; opacity: 0.9;">
                GitHub API暂时不可用，显示示例项目数据
            </div>
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notice);
        
        setTimeout(() => {
            if (document.body.contains(notice)) {
                document.body.removeChild(notice);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 5000);
    }

    // 渲染项目卡片
    renderProjects() {
        const container = document.getElementById('projects-grid');
        if (!container) return;

        const filteredProjects = this.currentFilter === 'all' 
            ? this.projects 
            : this.projects.filter(p => p.language === this.currentFilter);

        container.innerHTML = filteredProjects.map(project => `
            <div class="project-card" data-language="${project.language}" style="
                background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                border-radius: 15px;
                border: 1px solid rgba(255,255,255,0.2);
                backdrop-filter: blur(10px);
                padding: 1.5rem;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            ">
                <!-- 项目状态标签 -->
                <div class="project-status" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    display: flex;
                    gap: 0.5rem;
                ">
                    ${project.private ? '<span style="background: #ef4444; color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.8rem;">私有</span>' : ''}
                    ${project.archived ? '<span style="background: #6b7280; color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.8rem;">已归档</span>' : ''}
                    ${project.fork ? '<span style="background: #3b82f6; color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.8rem;">Fork</span>' : ''}
                </div>

                <!-- 项目标题和基本信息 -->
                <div class="project-header" style="margin-bottom: 1rem;">
                    <h3 class="project-title" style="
                        font-size: 1.4rem;
                        margin-bottom: 0.5rem;
                        color: #ffffff;
                    ">
                        <a href="${project.url}" target="_blank" rel="noopener" style="
                            color: inherit;
                            text-decoration: none;
                            transition: color 0.3s ease;
                        " onmouseover="this.style.color='#60a5fa'" onmouseout="this.style.color='#ffffff'">
                            ${project.name}
                        </a>
                    </h3>
                    <p class="project-full-name" style="
                        color: #9ca3af;
                        font-size: 0.9rem;
                        margin-bottom: 0.5rem;
                    ">${project.fullName}</p>
                </div>

                <!-- 项目描述 -->
                <p class="project-description" style="
                    color: #e5e7eb;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                    font-size: 1rem;
                ">${project.description}</p>

                <!-- 项目统计信息 -->
                <div class="project-stats" style="
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: rgba(0,0,0,0.2);
                    border-radius: 10px;
                ">
                    <span class="project-stars" style="display: flex; align-items: center; gap: 0.3rem;">
                        ⭐ <strong>${project.stars}</strong> 星标
                    </span>
                    <span class="project-forks" style="display: flex; align-items: center; gap: 0.3rem;">
                        🍴 <strong>${project.forks}</strong> Fork
                    </span>
                    <span class="project-watchers" style="display: flex; align-items: center; gap: 0.3rem;">
                        👁️ <strong>${project.watchers}</strong> 关注
                    </span>
                    <span class="project-issues" style="display: flex; align-items: center; gap: 0.3rem;">
                        🐛 <strong>${project.issues}</strong> 问题
                    </span>
                    <span class="project-size" style="display: flex; align-items: center; gap: 0.3rem;">
                        📦 <strong>${this.formatSize(project.size)}</strong>
                    </span>
                    <span class="project-activity" style="display: flex; align-items: center; gap: 0.3rem;">
                        🔥 <strong>${project.activityScore || 0}</strong> 活跃度
                    </span>
                </div>

                <!-- 项目标签和元信息 -->
                <div class="project-footer" style="margin-bottom: 1rem;">
                    <div class="project-tags" style="
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                        margin-bottom: 1rem;
                    ">
                        <span class="project-language" style="
                            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                            color: white;
                            padding: 0.5rem 1rem;
                            border-radius: 20px;
                            font-weight: 600;
                            font-size: 0.9rem;
                        ">${project.language}</span>
                        ${project.topics.map(topic => `<span class="topic-tag" style="
                            background: rgba(255,255,255,0.2);
                            color: #e5e7eb;
                            padding: 0.3rem 0.8rem;
                            border-radius: 15px;
                            font-size: 0.8rem;
                            border: 1px solid rgba(255,255,255,0.3);
                        ">${topic}</span>`).join('')}
                    </div>
                    
                    <div class="project-meta" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 0.9rem;
                        color: #9ca3af;
                    ">
                        <span>创建于 ${this.formatDate(project.created)}</span>
                        <span>更新于 ${this.formatDate(project.updated)}</span>
                    </div>
                </div>

                <!-- 项目链接 -->
                <div class="project-links" style="
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                ">
                    <a href="${project.url}" target="_blank" rel="noopener" style="
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        padding: 0.8rem 1.5rem;
                        border-radius: 25px;
                        text-decoration: none;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔗 查看仓库
                    </a>
                    ${project.homepage ? `<a href="${project.homepage}" target="_blank" rel="noopener" style="
                        background: linear-gradient(135deg, #f59e0b, #d97706);
                        color: white;
                        padding: 0.8rem 1.5rem;
                        border-radius: 25px;
                        text-decoration: none;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🌐 在线演示
                    </a>` : ''}
                                         <a href="#" 
                        onclick="projectManager.downloadProject('${project.name}'); return false;"
                        style="
                         background: linear-gradient(135deg, #6b7280, #4b5563);
                         color: white;
                         padding: 0.8rem 1.5rem;
                         border-radius: 25px;
                         text-decoration: none;
                         font-weight: 600;
                         transition: all 0.3s ease;
                         display: inline-flex;
                         align-items: center;
                         gap: 0.5rem;
                         cursor: pointer;
                     " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                         📥 下载ZIP
                     </a>
                     <a href="#" 
                        onclick="projectManager.copyCloneUrl('${project.cloneUrl}', '${project.name}'); return false;"
                        style="
                         background: linear-gradient(135deg, #374151, #1f2937);
                         color: white;
                         padding: 0.8rem 1.5rem;
                         border-radius: 25px;
                         text-decoration: none;
                         font-weight: 600;
                         transition: all 0.3s ease;
                         display: inline-flex;
                         align-items: center;
                         gap: 0.5rem;
                         font-size: 0.9rem;
                         cursor: pointer;
                     " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                         📋 复制克隆链接
                     </a>
                </div>

                                 <!-- 许可证信息 -->
                 ${project.license !== '无许可证' ? `<div class="project-license" style="
                     margin-top: 1rem;
                     padding: 0.5rem 1rem;
                     background: rgba(255,255,255,0.1);
                     border-radius: 10px;
                     text-align: center;
                     color: #9ca3af;
                     font-size: 0.9rem;
                 ">
                     📄 许可证: ${project.license}
                 </div>` : ''}

                 <!-- README预览区域 -->
                 <div class="readme-section" style="
                     margin-top: 1.5rem;
                     border-top: 1px solid rgba(255,255,255,0.1);
                     padding-top: 1.5rem;
                 ">
                     <button class="readme-toggle" 
                             onclick="projectManager.toggleReadme('${project.name}')" 
                             style="
                                 background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                                 color: white;
                                 border: none;
                                 padding: 0.8rem 1.5rem;
                                 border-radius: 25px;
                                 font-weight: 600;
                                 cursor: pointer;
                                 transition: all 0.3s ease;
                                 display: inline-flex;
                                 align-items: center;
                                 gap: 0.5rem;
                                 width: 100%;
                                 justify-content: center;
                             " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                         📖 查看项目说明
                     </button>
                     
                     <div id="readme-${project.name}" class="readme-content" style="
                         display: none;
                         margin-top: 1rem;
                         padding: 1rem;
                         background: rgba(0,0,0,0.3);
                         border-radius: 10px;
                         border: 1px solid rgba(255,255,255,0.1);
                         max-height: 900px;
                         overflow-y: auto;
                         position: relative;
                     ">
                         <div class="readme-loading" style="
                             text-align: center;
                             color: #9ca3af;
                             padding: 2rem;
                         ">
                             <div class="loading-spinner" style="
                                 width: 30px;
                                 height: 30px;
                                 border: 3px solid rgba(255,255,255,0.3);
                                 border-top: 3px solid #8b5cf6;
                                 border-radius: 50%;
                                 animation: spin 1s linear infinite;
                                 margin: 0 auto 1rem;
                             "></div>
                             正在加载项目说明...
                         </div>
                         <div class="readme-text" style="
                             display: none;
                             color: #e5e7eb;
                             line-height: 1.6;
                             font-size: 0.9rem;
                         "></div>
                         <div class="readme-error" style="
                             display: none;
                             color: #ef4444;
                             text-align: center;
                             padding: 1rem;
                         "></div>
                     </div>
                 </div>
             </div>
         `).join('');
    }

    // 渲染语言筛选按钮
    renderLanguageFilters() {
        const container = document.getElementById('language-filters');
        if (!container) return;

        const languages = ['all', ...Array.from(this.languages)].sort();
        
        // 添加缓存状态显示和刷新按钮
        const cacheInfo = this.cache.lastFetch ? `
            <div class="cache-info" style="
                margin-bottom: 1rem;
                padding: 0.8rem;
                background: rgba(139, 92, 246, 0.1);
                border-radius: 10px;
                border: 1px solid rgba(139, 92, 246, 0.3);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 1rem;
            ">
                <div style="color: #9ca3af; font-size: 0.9rem;">
                    📦 缓存状态: ${this.cache.projects ? '已缓存' : '未缓存'}
                    ${this.cache.lastFetch ? `<br>⏰ 更新时间: ${new Date(this.cache.lastFetch).toLocaleString()}` : ''}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="projectManager.refreshData()" style="
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 8px;
                        font-size: 0.8rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔄 刷新数据
                    </button>
                    <button onclick="projectManager.clearCache()" style="
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 8px;
                        font-size: 0.8rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                        🗑️ 清理缓存
                    </button>
                </div>
            </div>
        ` : '';

        container.innerHTML = cacheInfo + languages.map(lang => `
            <button class="filter-btn ${lang === this.currentFilter ? 'active' : ''}" 
                    data-language="${lang}">
                ${lang === 'all' ? '全部' : lang}
            </button>
        `).join('');

        // 绑定筛选事件
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const language = e.target.dataset.language;
                this.filterProjects(language);
            }
        });
    }

    // 筛选项目
    filterProjects(language) {
        this.currentFilter = language;
        
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.language === language);
        });

        // 重新渲染项目
        this.renderProjects();
    }

    // 显示加载状态
    showLoadingState() {
        const container = document.getElementById('projects-grid');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>正在加载项目数据...</p>
                </div>
            `;
        }
    }

    // 隐藏加载状态
    hideLoadingState() {
        const loadingState = document.querySelector('.loading-state');
        if (loadingState) {
            loadingState.remove();
        }
    }

    // 显示错误状态
    showErrorState(message) {
        const container = document.getElementById('projects-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <p>❌ ${message}</p>
                    <button onclick="projectManager.fetchProjects()" class="retry-btn">
                        重试
                    </button>
                </div>
            `;
        }
    }

    // 格式化日期
    formatDate(date) {
        return new Date(date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // 格式化仓库大小
    formatSize(sizeInKB) {
        if (sizeInKB < 1024) {
            return `${sizeInKB} KB`;
        } else if (sizeInKB < 1024 * 1024) {
            return `${(sizeInKB / 1024).toFixed(1)} MB`;
        } else {
            return `${(sizeInKB / (1024 * 1024)).toFixed(1)} GB`;
        }
    }

    // 项目卡片动画
    animateProjectCards() {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // 切换README显示状态
    toggleReadme(projectName) {
        console.log(`🔄 切换README显示状态: ${projectName}`);
        
        const readmeContent = document.getElementById(`readme-${projectName}`);
        if (!readmeContent) {
            console.error(`README容器未找到: readme-${projectName}`);
            return;
        }
        
        // 更安全的方式查找按钮 - 通过onclick属性查找
        const button = document.querySelector(`button[onclick*="toggleReadme('${projectName}')"]`);
        if (!button) {
            console.error(`README按钮未找到: ${projectName}`);
            return;
        }
        
        if (readmeContent.style.display === 'none') {
            // 显示README
            readmeContent.style.display = 'block';
            button.innerHTML = '📖 隐藏项目说明';
            button.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            
            // 加载README内容
            this.loadReadme(projectName);
        } else {
            // 隐藏README
            readmeContent.style.display = 'none';
            button.innerHTML = '📖 查看项目说明';
            button.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
        }
    }

    // 加载README内容
    async loadReadme(projectName) {
        const project = this.projects.find(p => p.name === projectName);
        if (!project) {
            console.error(`项目未找到: ${projectName}`);
            return;
        }

        console.log(`🔍 开始加载README: ${projectName}`, project);

        const readmeContent = document.getElementById(`readme-${projectName}`);
        if (!readmeContent) {
            console.error(`README容器未找到: readme-${projectName}`);
            return;
        }

        const loadingEl = readmeContent.querySelector('.readme-loading');
        const textEl = readmeContent.querySelector('.readme-text');
        const errorEl = readmeContent.querySelector('.readme-error');
        
        // 安全检查所有必需的元素
        if (!loadingEl || !textEl || !errorEl) {
            console.error(`README内容元素未找到: ${projectName}`);
            return;
        }

        // 显示加载状态
        loadingEl.style.display = 'block';
        textEl.style.display = 'none';
        errorEl.style.display = 'none';

        try {
            // 首先尝试获取项目的默认分支信息
            let defaultBranch = 'main';
            try {
                const repoResponse = await fetch(`https://api.github.com/repos/${GITHUB_API_CONFIG.username}/${projectName}`);
                if (repoResponse.ok) {
                    const repoData = await repoResponse.json();
                    defaultBranch = repoData.default_branch || 'main';
                    console.log(`📋 项目默认分支: ${defaultBranch}`);
                }
            } catch (e) {
                console.log(`⚠️ 无法获取默认分支，使用main: ${e.message}`);
            }

            // 尝试多个可能的README路径和分支
            const readmePaths = [
                // 使用默认分支
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/${defaultBranch}/README.md`,
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/${defaultBranch}/readme.md`,
                // 主要分支
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/main/README.md`,
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/master/README.md`,
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/main/readme.md`,
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/master/readme.md`,
                // 其他常见分支
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/develop/README.md`,
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/dev/README.md`,
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/develop/readme.md`,
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/dev/readme.md`,
                // GitHub Pages 特殊处理
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/gh-pages/README.md`,
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/gh-pages/readme.md`,
                // 根目录尝试
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/main/README.md`,
                `https://raw.githubusercontent.com/${GITHUB_API_CONFIG.username}/${projectName}/master/README.md`
            ];

            let readmeText = '';
            let success = false;
            let lastError = '';

            for (const path of readmePaths) {
                try {
                    console.log(`🔍 尝试路径: ${path}`);
                    const response = await fetch(path);
                    console.log(`📡 响应状态: ${response.status} ${response.statusText}`);
                    
                    if (response.ok) {
                        readmeText = await response.text();
                        if (readmeText.trim()) {
                            success = true;
                            console.log(`✅ 成功加载README: ${path}`);
                            break;
                        } else {
                            console.log(`⚠️ README文件为空: ${path}`);
                        }
                    } else {
                        lastError = `HTTP ${response.status}: ${response.statusText}`;
                        console.log(`❌ 请求失败: ${path} - ${lastError}`);
                    }
                } catch (e) {
                    lastError = e.message;
                    console.log(`❌ 网络错误: ${path} - ${e.message}`);
                    continue;
                }
            }

            if (success && readmeText.trim()) {
                // 处理Markdown内容，转换为HTML
                const processedText = this.processMarkdown(readmeText);
                
                // 隐藏加载状态，显示内容
                loadingEl.style.display = 'none';
                textEl.innerHTML = processedText;
                textEl.style.display = 'block';
                
                console.log(`📖 README内容已处理并显示 (${projectName})`);
            } else {
                throw new Error(`未找到README文件。尝试的路径: ${readmePaths.slice(0, 4).join(', ')}`);
            }

        } catch (error) {
            console.error(`加载README失败 (${projectName}):`, error);
            
            // 显示更详细的错误信息
            loadingEl.style.display = 'none';
            errorEl.innerHTML = `
                <div style="text-align: center; padding: 1.5rem;">
                    <p style="font-size: 1.1rem; margin-bottom: 1rem;">📝 该项目暂无详细说明文档</p>
                    <p style="font-size: 0.9rem; color: #9ca3af; margin-bottom: 1rem; line-height: 1.5;">
                        可能的原因：<br>
                        • 项目没有README.md文件<br>
                        • README文件在其他分支<br>
                        • 文件命名不同（如readme.md）
                    </p>
                    <div style="margin-top: 1rem;">
                        <a href="${project.url}" target="_blank" style="
                            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                            color: white;
                            padding: 0.8rem 1.5rem;
                            border-radius: 25px;
                            text-decoration: none;
                            font-weight: 600;
                            display: inline-flex;
                            align-items: center;
                            gap: 0.5rem;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            🔗 在GitHub上查看
                        </a>
                    </div>
                    <p style="font-size: 0.8rem; color: #9ca3af; margin-top: 1rem;">
                        调试信息: 尝试了 ${readmePaths.length} 个路径
                    </p>
                </div>
            `;
            errorEl.style.display = 'block';
        }
    }

    // 下载项目ZIP文件
    async downloadProject(projectName) {
        try {
            // 尝试不同的分支
            const branches = ['main', 'master', 'develop', 'dev'];
            let downloadUrl = '';
            let success = false;

            for (const branch of branches) {
                const testUrl = `https://github.com/${GITHUB_API_CONFIG.username}/${projectName}/archive/refs/heads/${branch}.zip`;
                
                try {
                    const response = await fetch(testUrl, { method: 'HEAD' });
                    if (response.ok) {
                        downloadUrl = testUrl;
                        success = true;
                        console.log(`✅ 找到可下载的分支: ${branch}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (success) {
                // 创建下载链接
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `${projectName}.zip`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log(`📥 开始下载: ${projectName}.zip`);
                
                // 显示下载成功提示
                this.showDownloadSuccess(projectName);
            } else {
                // 如果所有分支都失败，使用默认的main分支
                const fallbackUrl = `https://github.com/${GITHUB_API_CONFIG.username}/${projectName}/archive/refs/heads/main.zip`;
                const link = document.createElement('a');
                link.href = fallbackUrl;
                link.download = `${projectName}.zip`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log(`📥 使用默认分支下载: ${projectName}.zip`);
                
                // 显示下载成功提示
                this.showDownloadSuccess(projectName);
            }

        } catch (error) {
            console.error(`下载失败 (${projectName}):`, error);
            
            // 显示错误提示
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-weight: 600;
            `;
            errorMsg.textContent = `下载失败: ${projectName}`;
            document.body.appendChild(errorMsg);
            
            setTimeout(() => {
                document.body.removeChild(errorMsg);
            }, 3000);
        }
    }

    // 显示下载成功提示
    showDownloadSuccess(projectName) {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease-out;
        `;
        successMsg.innerHTML = `
            <span>✅</span>
            <span>开始下载: ${projectName}.zip</span>
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 3000);
    }

    // 复制克隆链接到剪贴板
    async copyCloneUrl(cloneUrl, projectName) {
        try {
            // 使用现代剪贴板API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(cloneUrl);
                console.log(`📋 克隆链接已复制到剪贴板: ${projectName}`);
                this.showCopySuccess(projectName, '克隆链接');
            } else {
                // 降级方案：使用传统的document.execCommand
                const textArea = document.createElement('textarea');
                textArea.value = cloneUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    console.log(`📋 克隆链接已复制到剪贴板: ${projectName}`);
                    this.showCopySuccess(projectName, '克隆链接');
                } else {
                    throw new Error('复制失败');
                }
            }
        } catch (error) {
            console.error(`复制克隆链接失败 (${projectName}):`, error);
            
            // 显示错误提示
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            `;
            errorMsg.innerHTML = `
                <span>❌</span>
                <span>复制失败: ${projectName}</span>
            `;
            document.body.appendChild(errorMsg);
            
            setTimeout(() => {
                if (document.body.contains(errorMsg)) {
                    document.body.removeChild(errorMsg);
                }
            }, 3000);
        }
    }

    // 显示复制成功提示
    showCopySuccess(projectName, type) {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease-out;
        `;
        successMsg.innerHTML = `
            <span>📋</span>
            <span>${type}已复制: ${projectName}</span>
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 3000);
    }

    // 增强的Markdown转HTML处理
    processMarkdown(markdown) {
        let html = markdown
            // 处理标题 (支持更多级别)
            .replace(/^###### (.*$)/gim, '<h6 style="color: #e5e7eb; margin: 0.8rem 0 0.4rem 0; font-size: 0.9rem;">$1</h6>')
            .replace(/^##### (.*$)/gim, '<h5 style="color: #e5e7eb; margin: 1rem 0 0.5rem 0; font-size: 1rem;">$1</h5>')
            .replace(/^#### (.*$)/gim, '<h4 style="color: #f3f4f6; margin: 1.2rem 0 0.6rem 0; font-size: 1.2rem;">$1</h4>')
            .replace(/^### (.*$)/gim, '<h3 style="color: #ffffff; margin: 1.5rem 0 0.8rem 0; font-size: 1.3rem;">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 style="color: #ffffff; margin: 2rem 0 1rem 0; font-size: 1.5rem;">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 style="color: #ffffff; margin: 2.5rem 0 1.5rem 0; font-size: 1.8rem;">$1</h1>')
            
            // 处理粗体和斜体
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff; font-weight: 700;">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em style="color: #fbbf24; font-style: italic;">$1</em>')
            .replace(/_(.*?)_/g, '<em style="color: #fbbf24; font-style: italic;">$1</em>')
            
            // 处理代码块 (支持语言标识)
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background: rgba(0,0,0,0.6); padding: 1.5rem; border-radius: 10px; overflow-x: auto; margin: 1.5rem 0; border-left: 4px solid #10b981;"><code style="color: #10b981; font-family: \'Consolas\', \'Monaco\', monospace; font-size: 0.9rem; line-height: 1.4;">$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.3rem 0.5rem; border-radius: 6px; font-family: \'Consolas\', \'Monaco\', monospace; font-size: 0.9rem;">$1</code>')
            
            // 处理链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #60a5fa; text-decoration: underline; transition: color 0.3s ease;" onmouseover="this.style.color=\'#93c5fd\'" onmouseout="this.style.color=\'#60a5fa\'">$1</a>')
            
            // 处理图片
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" onerror="this.style.display=\'none\'" />')
            
            // 处理列表 (支持嵌套)
            .replace(/^\* (.*$)/gim, '<li style="margin: 0.4rem 0; line-height: 1.6;">• $1</li>')
            .replace(/^- (.*$)/gim, '<li style="margin: 0.4rem 0; line-height: 1.6;">• $1</li>')
            .replace(/^(\d+)\. (.*$)/gim, '<li style="margin: 0.4rem 0; line-height: 1.6;">$1. $2</li>')
            
            // 处理引用块
            .replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #8b5cf6; padding-left: 1rem; margin: 1rem 0; background: rgba(139, 92, 246, 0.1); border-radius: 0 8px 8px 0; font-style: italic; color: #d1d5db;">$1</blockquote>')
            
            // 处理分割线
            .replace(/^---$/gim, '<hr style="border: none; height: 2px; background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent); margin: 2rem 0;">')
            
            // 处理段落
            .replace(/\n\n/g, '</p><p style="margin: 1rem 0; line-height: 1.7;">')
            .replace(/^(?!<[h|li|pre|ul|ol|blockquote|hr])(.*$)/gim, '<p style="margin: 0.8rem 0; line-height: 1.7;">$1</p>');

        // 包装列表项 (支持嵌套)
        html = html.replace(/(<li[^>]*>.*<\/li>)/g, '<ul style="margin: 0.8rem 0; padding-left: 1.8rem;">$1</ul>');
        
        // 清理多余的段落标签和空内容
        html = html.replace(/<p><\/p>/g, '').replace(/<p style="margin: 0.8rem 0; line-height: 1.7;"><\/p>/g, '');
        
        // 添加整体容器样式
        html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${html}</div>`;
        
        return html;
    }
}
