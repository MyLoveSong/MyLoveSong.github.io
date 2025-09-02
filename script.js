// 音乐盛宴网站 - 现代化音乐主题JavaScript功能

// GitHub API 配置
const GITHUB_API_CONFIG = {
    baseUrl: 'https://api.github.com',
    username: 'MyLoveSong', // 请替换为你的GitHub用户名
    perPage: 30
};

// 项目数据管理类 - 面向对象编程
class ProjectManager {
    constructor() {
        this.projects = [];
        this.languages = new Set();
        this.currentFilter = 'all';
        this.isLoading = false;
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
                    statusEl.textContent = '提交失败，请稍后再试或直接邮件联系。';
                }
            } catch (err) {
                statusEl.textContent = '网络错误，提交未成功。';
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
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();
        
        try {
            const response = await fetch(
                `${GITHUB_API_CONFIG.baseUrl}/users/${GITHUB_API_CONFIG.username}/repos?per_page=${GITHUB_API_CONFIG.perPage}&sort=updated`
            );
            
            if (!response.ok) {
                throw new Error(`GitHub API 请求失败: ${response.status}`);
            }
            
            const repos = await response.json();
            this.projects = repos.map(repo => ({
                id: repo.id,
                name: repo.name,
                description: repo.description || '暂无描述',
                language: repo.language || '其他',
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                url: repo.html_url,
                homepage: repo.homepage,
                updated: new Date(repo.updated_at),
                topics: repo.topics || []
            }));
            
            // 提取所有编程语言
            this.projects.forEach(project => {
                if (project.language) {
                    this.languages.add(project.language);
                }
            });
            
            this.renderProjects();
            this.renderLanguageFilters();
            
        } catch (error) {
            console.error('获取项目数据失败:', error);
            this.showErrorState(error.message);
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    // 渲染项目列表
    renderProjects() {
        const projectsContainer = document.getElementById('projects-grid');
        if (!projectsContainer) return;

        const filteredProjects = this.currentFilter === 'all' 
            ? this.projects 
            : this.projects.filter(project => project.language === this.currentFilter);

        projectsContainer.innerHTML = filteredProjects.map(project => `
            <div class="project-card" data-language="${project.language}">
                <div class="project-header">
                    <h3 class="project-title">
                        <a href="${project.url}" target="_blank" rel="noopener noreferrer">
                            ${project.name}
                        </a>
                    </h3>
                    <span class="project-language">${project.language}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <span class="project-stars">⭐ ${project.stars}</span>
                    <span class="project-forks">🔀 ${project.forks}</span>
                    <span class="project-updated">📅 ${this.formatDate(project.updated)}</span>
                </div>
                ${project.topics.length > 0 ? `
                    <div class="project-topics">
                        ${project.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="project-actions">
                    <a href="${project.url}" class="btn-primary" target="_blank" rel="noopener noreferrer">
                        查看代码
                    </a>
                    ${project.homepage ? `
                        <a href="${project.homepage}" class="btn-secondary" target="_blank" rel="noopener noreferrer">
                            在线演示
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // 添加动画效果
        this.animateProjectCards();
    }

    // 渲染语言筛选器
    renderLanguageFilters() {
        const filterContainer = document.getElementById('language-filters');
        if (!filterContainer) return;

        const languages = ['all', ...Array.from(this.languages).sort()];
        
        filterContainer.innerHTML = languages.map(lang => `
            <button class="filter-btn ${lang === 'all' ? 'active' : ''}" 
                    data-language="${lang}">
                ${lang === 'all' ? '全部' : lang}
            </button>
        `).join('');

        // 绑定筛选事件
        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const language = e.target.dataset.language;
                this.filterProjects(language);
                
                // 更新按钮状态
                filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });
    }

    // 筛选项目
    filterProjects(language) {
        this.currentFilter = language;
        
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const cardLanguage = card.dataset.language;
            const shouldShow = language === 'all' || cardLanguage === language;
            
            if (shouldShow) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.6s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // 显示加载状态
    showLoadingState() {
        const projectsContainer = document.getElementById('projects-grid');
        if (projectsContainer) {
            projectsContainer.innerHTML = `
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
        const projectsContainer = document.getElementById('projects-grid');
        if (projectsContainer) {
            projectsContainer.innerHTML = `
                <div class="error-state">
                    <p>❌ 加载失败: ${message}</p>
                    <button onclick="projectManager.fetchProjects()" class="btn-primary">
                        重试
                    </button>
                </div>
            `;
        }
    }

    // 格式化日期
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return '今天';
        if (days === 1) return '昨天';
        if (days < 7) return `${days}天前`;
        if (days < 30) return `${Math.floor(days / 7)}周前`;
        if (days < 365) return `${Math.floor(days / 30)}个月前`;
        return `${Math.floor(days / 365)}年前`;
    }

    // 项目卡片动画
    animateProjectCards() {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }
}

// 技能可视化类
class SkillVisualizer {
    constructor() {
        this.skills = [
            { name: 'JavaScript', level: 90, color: '#f7df1e' },
            { name: 'HTML/CSS', level: 85, color: '#e34f26' },
            { name: 'React', level: 80, color: '#61dafb' },
            { name: 'Node.js', level: 75, color: '#339933' },
            { name: 'Python', level: 70, color: '#3776ab' },
            { name: 'Git', level: 85, color: '#f05032' }
        ];
    }

    // 初始化技能条
    initSkillBars() {
        const skillsContainer = document.getElementById('skills-container');
        if (!skillsContainer) return;

        skillsContainer.innerHTML = this.skills.map(skill => `
            <div class="skill-item">
                <div class="skill-info">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-level">${skill.level}%</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-progress" 
                         style="width: 0%; background-color: ${skill.color}"
                         data-level="${skill.level}">
                    </div>
                </div>
            </div>
        `).join('');

        // 使用 Intersection Observer 触发动画
        this.observeSkillBars();
        // 初始化雷达图
        this.initRadarChart();
    }

    // 观察技能条并触发动画
    observeSkillBars() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target.querySelector('.skill-progress');
                    const level = progressBar.dataset.level;
                    
                    // 触发进度条动画
                    setTimeout(() => {
                        progressBar.style.width = `${level}%`;
                    }, 200);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        skillItems.forEach(item => observer.observe(item));
    }

    // 初始化雷达图
    initRadarChart() {
        const radarContainer = document.getElementById('radar-chart');
        if (!radarContainer) return;

        // 优先使用 Chart.js；若不可用，降级到内置 Canvas 绘制
        if (window.Chart) {
            const canvas = document.createElement('canvas');
            radarContainer.appendChild(canvas);
            const labels = this.skills.map(s => s.name);
            const data = this.skills.map(s => s.level);
            new Chart(canvas.getContext('2d'), {
                type: 'radar',
                data: {
                    labels,
                    datasets: [{
                        label: '技能熟练度',
                        data,
                        backgroundColor: 'rgba(102, 126, 234, 0.25)',
                        borderColor: '#667eea',
                        pointBackgroundColor: '#764ba2',
                        pointBorderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    scales: { r: { suggestedMin: 0, suggestedMax: 100, angleLines: { color: '#e0e0e0' }, grid: { color: 'rgba(255,255,255,0.2)' }, pointLabels: { color: '#fff' } } },
                    plugins: { legend: { labels: { color: '#fff' } } }
                }
            });
            return;
        }

        // Fallback: 内置 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        radarContainer.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        this.drawRadarChart(ctx);
    }

    // 绘制雷达图
    drawRadarChart(ctx) {
        const centerX = 150;
        const centerY = 150;
        const radius = 100;
        const skills = this.skills.slice(0, 6); // 最多显示6个技能
        const angleStep = (2 * Math.PI) / skills.length;

        // 绘制网格
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        for (let i = 1; i <= 5; i++) {
            const currentRadius = (radius * i) / 5;
            ctx.beginPath();
            skills.forEach((skill, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const x = centerX + currentRadius * Math.cos(angle);
                const y = centerY + currentRadius * Math.sin(angle);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.closePath();
            ctx.stroke();
        }

        // 绘制技能点
        ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        ctx.beginPath();
        skills.forEach((skill, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const skillRadius = (radius * skill.level) / 100;
            const x = centerX + skillRadius * Math.cos(angle);
            const y = centerY + skillRadius * Math.sin(angle);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fill();

        // 绘制技能标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        skills.forEach((skill, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelRadius = radius + 20;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            
            ctx.fillText(skill.name, x, y);
        });
    }
}

// 时间轴管理类
class TimelineManager {
    constructor() {
        this.timelineData = [
            {
                year: '2018',
                title: '音乐启蒙',
                description: '开始接触音乐，学习基础乐理知识',
                icon: '🎵'
            },
            {
                year: '2019',
                title: '技能提升',
                description: '深入学习钢琴演奏和音乐创作',
                icon: '🎹'
            },
            {
                year: '2020',
                title: '首次演出',
                description: '参加校园音乐节，获得观众好评',
                icon: '🎭'
            },
            {
                year: '2021',
                title: '专业发展',
                description: '开始专业音乐制作和编曲工作',
                icon: '🎼'
            },
            {
                year: '2022',
                title: '作品发布',
                description: '发布首张个人专辑，获得业界认可',
                icon: '💿'
            },
            {
                year: '2023',
                title: '国际交流',
                description: '参与国际音乐节，与各国音乐家交流',
                icon: '🌍'
            }
        ];
    }

    // 初始化时间轴
    initTimeline() {
        const timelineContainer = document.getElementById('timeline-container');
        if (!timelineContainer) return;

        timelineContainer.innerHTML = this.timelineData.map((item, index) => `
            <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}" data-index="${index}">
                <div class="timeline-content">
                    <div class="timeline-icon">${item.icon}</div>
                    <div class="timeline-year">${item.year}</div>
                    <h3 class="timeline-title">${item.title}</h3>
                    <p class="timeline-description">${item.description}</p>
                </div>
            </div>
        `).join('');

        // 添加交互效果
        this.addTimelineInteractions();
    }

    // 添加时间轴交互
    addTimelineInteractions() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.classList.add('active');
            });
            
            item.addEventListener('mouseleave', () => {
                item.classList.remove('active');
            });
            
            item.addEventListener('click', () => {
                this.showTimelineDetail(item.dataset.index);
            });
        });
    }

    // 显示时间轴详情
    showTimelineDetail(index) {
        const item = this.timelineData[index];
        const modal = document.createElement('div');
        modal.className = 'timeline-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div class="modal-header">
                    <div class="modal-icon">${item.icon}</div>
                    <h2>${item.year} - ${item.title}</h2>
                </div>
                <div class="modal-body">
                    <p>${item.description}</p>
                    <div class="modal-details">
                        <h3>详细经历</h3>
                        <p>这里是关于${item.title}的详细描述，包括具体的时间、地点、人物和事件。这段经历对音乐生涯产生了重要影响，为后续的发展奠定了坚实基础。</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // 关闭模态框
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// 博客系统类
class BlogSystem {
    constructor() {
        this.posts = [
            {
                id: 1,
                title: '音乐创作的心路历程',
                excerpt: '分享我在音乐创作过程中的思考与感悟...',
                content: `# 音乐创作的心路历程

音乐创作是一个充满挑战和惊喜的过程。每一首作品的诞生都承载着创作者的情感和思考。

## 创作灵感

灵感往往来自于生活中的点点滴滴：
- 清晨的阳光
- 雨后的彩虹
- 深夜的星空
- 朋友的笑容

## 创作技巧

在创作过程中，我总结了一些实用的技巧：

1. **保持记录**：随时记录灵感和想法
2. **多听多学**：广泛接触不同类型的音乐
3. **勤加练习**：每天保持练习和创作
4. **接受反馈**：虚心接受他人的建议

## 创作心得

音乐创作不仅仅是技术的积累，更是心灵的表达。每一首作品都是创作者内心世界的映射。

> "音乐是世界的通用语言，它能够跨越国界、种族和文化，连接每一个人的心灵。"

让我们一起在音乐的世界中探索、成长、创造！`,
                date: '2024-01-15',
                tags: ['创作', '音乐', '感悟']
            },
            {
                id: 2,
                title: '古典与现代的融合',
                excerpt: '探讨如何将古典音乐元素融入现代创作中...',
                content: `# 古典与现代的融合

在音乐创作中，古典与现代的融合是一个永恒的话题。

## 古典音乐的魅力

古典音乐以其严谨的结构和深厚的内涵著称：
- 巴赫的复调音乐
- 莫扎特的旋律之美
- 贝多芬的情感表达
- 肖邦的诗意浪漫

## 现代元素的运用

现代音乐元素为古典音乐注入了新的活力：
- 电子音效的加入
- 节奏的变化
- 和声的扩展
- 配器的创新

## 融合的艺术

成功的融合需要：
1. 深入理解古典音乐的精髓
2. 掌握现代音乐的表现手法
3. 找到两者之间的平衡点
4. 保持音乐的整体性

让我们一起探索古典与现代音乐的无限可能！`,
                date: '2024-01-10',
                tags: ['古典', '现代', '融合']
            }
        ];
    }

    // 初始化博客系统
    initBlog() {
        this.renderBlogList();
        this.setupBlogInteractions();
    }

    // 渲染博客列表
    renderBlogList() {
        const blogContainer = document.getElementById('blog-container');
        if (!blogContainer) return;

        blogContainer.innerHTML = this.posts.map(post => `
            <article class="blog-post" data-post-id="${post.id}">
                <header class="post-header">
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">
                        <time class="post-date">${this.formatDate(post.date)}</time>
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </header>
                <div class="post-excerpt">
                    <p>${post.excerpt}</p>
                </div>
                <footer class="post-footer">
                    <button class="read-more-btn" data-post-id="${post.id}">
                        阅读全文
                    </button>
                </footer>
            </article>
        `).join('');
    }

    // 设置博客交互
    setupBlogInteractions() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('read-more-btn')) {
                const postId = parseInt(e.target.dataset.postId);
                this.showBlogPost(postId);
            }
        });
    }

    // 显示博客文章
    showBlogPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const modal = document.createElement('div');
        modal.className = 'blog-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <article class="blog-post-full">
                    <header class="post-header">
                        <h1>${post.title}</h1>
                        <div class="post-meta">
                            <time>${this.formatDate(post.date)}</time>
                            <div class="post-tags">
                                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    </header>
                    <div class="post-content">
                        ${this.parseMarkdown(post.content)}
                    </div>
                </article>
            </div>
        `;

        document.body.appendChild(modal);
        
        // 关闭模态框
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 简单的 Markdown 解析
    parseMarkdown(content) {
        return content
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
            .replace(/> (.*$)/gim, '<blockquote>$1</blockquote>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '');
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// 全局实例
let projectManager;
let skillVisualizer;
let timelineManager;
let blogSystem;

class MusicWebsite {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.typingIndex = 0;
        this.typingTexts = [
            "沉浸在音乐的无限魅力中",
            "从古典巴赫到现代流行",
            "感受音乐的永恒力量",
            "让音乐连接世界",
            "探索音乐的无限可能",
            "用旋律传递爱与美好"
        ];
        this.currentTextIndex = 0;
        this.isTyping = false;
        this.musicDecorations = [];
        this.particles = [];
        
        this.init();
    }

    init() {
        // 性能优化：使用 requestIdleCallback 延迟非关键初始化
        this.setupPerformanceOptimizations();
        
        // 关键功能立即初始化
        this.setupTheme();
        this.setupCustomCursor();
        this.setupTypingEffect();
        this.setupSmoothScrolling();
        
        // 地图功能立即初始化（重要功能）
        // 延迟一点时间确保DOM完全加载
        setTimeout(() => {
            this.setupTravelMap();
        }, 100);
        
        // 非关键功能延迟初始化
        requestIdleCallback(() => {
            this.setupMusicWorks();
            this.setupKonamiCode();
            this.setupPageVisibility();
            this.setupMusicDecorations();
            this.setupIntersectionObserver();
            this.setupHobbyExpansion();
            this.setupParticleBackground();
            this.setupPageTransitions();
            this.setupNavigationHighlight();
            this.setupLoadingProgress();
            this.setupButtonEffects();
            this.setupPaymentEffects();
            this.setupContactForm();
        });
    }

    // 日夜模式切换
    setupTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        
        // 应用保存的主题
        this.applyTheme();
        
        themeToggle.addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme();
            localStorage.setItem('theme', this.currentTheme);
            
            // 添加切换动画效果
            this.addThemeTransitionEffect();
        });
    }

    // 旅行地图（Leaflet）- 增强版用户体验
    async setupTravelMap() {
        console.log('开始初始化地图...');
        
        const mapEl = document.getElementById('map');
        if (!mapEl) {
            console.error('找不到地图容器元素 #map');
            return;
        }
        
        if (!window.L) {
            console.error('Leaflet 库未加载');
            return;
        }
        
        console.log('地图容器和 Leaflet 库检查通过');

        try {
            console.log('正在加载城市数据...');
            const response = await fetch('cities.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const cities = await response.json();
            console.log('城市数据加载成功:', cities);
            
            console.log('正在创建地图...');
            // 清除加载提示
            mapEl.innerHTML = '';
            
            // 创建增强版地图 - 参考高德地图、百度地图交互体验
            const map = L.map('map', { 
                // 缩放控制 - 参考主流地图应用
                scrollWheelZoom: true,
                wheelPxPerZoomLevel: 120, // 滚轮灵敏度，数值越小越敏感
                zoomSnap: 0.5, // 缩放步长
                zoomDelta: 0.5, // 缩放增量
                
                // 交互控制
                doubleClickZoom: true,
                boxZoom: true,
                keyboard: true,
                dragging: true,
                touchZoom: true,
                
                // 缩放范围
                minZoom: 3,
                maxZoom: 18,
                
                // 控件
                zoomControl: true,
                attributionControl: false, // 禁用版权控件
                
                // 性能优化
                preferCanvas: false,
                zoomAnimation: true,
                fadeAnimation: true,
                markerZoomAnimation: true,
                
                // 惯性滚动 - 参考移动端地图体验
                inertia: true,
                inertiaDeceleration: 3000,
                inertiaMaxSpeed: 1500,
                
                // 边界限制
                maxBounds: L.latLngBounds(
                    L.latLng(-85, -180),
                    L.latLng(85, 180)
                ),
                maxBoundsViscosity: 1.0
            }).setView([34.307, 108.934], 4);
            
            // 添加自定义控件和交互增强
            this.enhanceMapControls(map);
            this.addMapInteractionFeatures(map);
            
            console.log('正在添加地图图层...');
            // 使用更美观的瓦片图层
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19, 
                attribution: '', // 移除版权信息
                className: 'map-tiles'
            }).addTo(map);

            console.log('正在创建标记...');
            const markers = L.markerClusterGroup({
                chunkedLoading: true,
                maxClusterRadius: 50,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                iconCreateFunction: this.createClusterIcon
            });
            
            const allMarkers = [];

            cities.forEach((c, index) => {
                // 创建自定义标记图标
                const customIcon = this.createCustomMarker(c.type, index);
                
                const marker = L.marker(c.coords, { icon: customIcon })
                    .bindPopup(this.createEnhancedPopup(c), {
                        maxWidth: 300,
                        className: 'custom-popup'
                    })
                    .on('mouseover', function() { 
                        this.openPopup();
                        this.getElement().style.transform = 'scale(1.1)';
                    })
                    .on('mouseout', function() { 
                        this.getElement().style.transform = 'scale(1)';
                    })
                    .on('click', () => {
                        this.showCityDetails(c);
                    });
                    
                markers.addLayer(marker);
                allMarkers.push({...c, marker, index});
            });
            
            map.addLayer(markers);
            console.log('标记创建完成，共', allMarkers.length, '个标记');

            // 创建增强版筛选按钮
            this.createEnhancedFilters(cities, map, markers, allMarkers);

            // 添加地图统计信息
            this.updateMapStats(cities, '全部');

            // 全局变量供筛选使用
            window.mapInstance = map;
            window.allMarkersGroup = markers;
            window.allCityData = allMarkers;
            
            // 增强版筛选函数
            window.filterMapByType = (type) => {
                this.filterMapByType(type, map, markers, allMarkers, cities);
            };

            // 添加地图事件监听
            this.addMapEventListeners(map, markers, allMarkers);

            // 确保地图正确渲染
            setTimeout(() => {
                console.log('正在调整地图大小...');
                map.invalidateSize();
                if (markers.getLayers().length > 0) {
                    map.fitBounds(markers.getBounds(), { padding: [20, 20] });
                    console.log('地图初始化完成！');
                    
                    // 显示统计信息
                    const statsEl = document.getElementById('map-stats');
                    if (statsEl) {
                        statsEl.style.display = 'flex';
                    }
                }
            }, 500);
        } catch (err) {
            console.error('地图初始化失败:', err);
            console.warn('使用备用地图实现');
            // 降级到原始实现
            this.setupFallbackMap();
        }
    }

    // 创建自定义标记图标
    createCustomMarker(type, index) {
        const colors = {
            '历史': '#e74c3c',
            '现代': '#3498db', 
            '文化': '#f39c12',
            '生活': '#2ecc71',
            '自然': '#9b59b6'
        };
        
        const icons = {
            '历史': '🏛️',
            '现代': '🏙️',
            '文化': '🎭',
            '生活': '🏠',
            '自然': '🌿'
        };
        
        const color = colors[type] || '#667eea';
        const icon = icons[type] || '📍';
        
        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="
                    background: ${color};
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 3px solid white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    transition: all 0.3s ease;
                ">
                    ${icon}
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
    }

    // 创建增强版弹窗
    createEnhancedPopup(city) {
        return `
            <div class="city-popup">
                <div class="popup-header">
                    <h3>${city.name}</h3>
                    <span class="city-type">${city.type}</span>
                </div>
                <div class="popup-content">
                    <p>${city.story}</p>
                    <div class="popup-actions">
                        <button onclick="window.showCityDetails('${city.name}')" class="popup-btn">
                            查看详情
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 创建聚合图标
    createClusterIcon(cluster) {
        const count = cluster.getChildCount();
        const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';
        const colors = {
            small: '#2ecc71',
            medium: '#f39c12', 
            large: '#e74c3c'
        };
        
        return L.divIcon({
            className: 'custom-cluster',
            html: `
                <div style="
                    background: ${colors[size]};
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 3px solid white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                ">
                    ${count}
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
    }

    // 增强地图控件 - 参考主流地图应用
    enhanceMapControls(map) {
        // 自定义缩放控件样式
        this.customizeZoomControl(map);
        
        // 添加全屏按钮
        this.addFullscreenControl(map);
        
        // 添加定位按钮
        this.addLocationControl(map);
        
        // 添加图层切换控件
        this.addLayerControl(map);
        
        // 添加比例尺
        this.addScaleControl(map);
    }

    // 自定义缩放控件
    customizeZoomControl(map) {
        // 安全地移除默认缩放控件（如果存在）
        if (map.zoomControl) {
            try {
                map.removeControl(map.zoomControl);
            } catch (error) {
                console.warn('⚠️ 移除默认缩放控件时出现警告:', error.message);
            }
        }
        
        // 创建自定义缩放控件
        const zoomControl = L.control.zoom({
            position: 'topright',
            zoomInText: '+',
            zoomOutText: '−'
        });
        
        // 添加自定义样式 - 彩色主题
        zoomControl.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar leaflet-control');
            div.style.cssText = `
                background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
                overflow: hidden;
                border: 2px solid rgba(255, 255, 255, 0.3);
            `;
            
            const zoomIn = L.DomUtil.create('a', 'leaflet-control-zoom-in', div);
            zoomIn.innerHTML = '+';
            zoomIn.href = '#';
            zoomIn.title = '放大';
            zoomIn.style.cssText = `
                display: block;
                width: 32px;
                height: 32px;
                line-height: 32px;
                text-align: center;
                text-decoration: none;
                color: white;
                font-size: 20px;
                font-weight: bold;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                transition: all 0.3s ease;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            `;
            
            const zoomOut = L.DomUtil.create('a', 'leaflet-control-zoom-out', div);
            zoomOut.innerHTML = '−';
            zoomOut.href = '#';
            zoomOut.title = '缩小';
            zoomOut.style.cssText = `
                display: block;
                width: 32px;
                height: 32px;
                line-height: 32px;
                text-align: center;
                text-decoration: none;
                color: white;
                font-size: 20px;
                font-weight: bold;
                transition: all 0.3s ease;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            `;
            
            // 悬停效果 - 彩虹彩色主题
            zoomIn.onmouseover = () => {
                zoomIn.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)';
                zoomIn.style.color = '#fff';
                zoomIn.style.transform = 'scale(1.1)';
                zoomIn.style.boxShadow = '0 0 20px rgba(255, 154, 158, 0.6)';
            };
            zoomIn.onmouseout = () => {
                zoomIn.style.background = '';
                zoomIn.style.color = 'white';
                zoomIn.style.transform = 'scale(1)';
                zoomIn.style.boxShadow = '';
            };
            zoomOut.onmouseover = () => {
                zoomOut.style.background = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
                zoomOut.style.color = '#fff';
                zoomOut.style.transform = 'scale(1.1)';
                zoomOut.style.boxShadow = '0 0 20px rgba(168, 237, 234, 0.6)';
            };
            zoomOut.onmouseout = () => {
                zoomOut.style.background = '';
                zoomOut.style.color = 'white';
                zoomOut.style.transform = 'scale(1)';
                zoomOut.style.boxShadow = '';
            };
            
            // 点击事件
            zoomIn.onclick = (e) => {
                e.preventDefault();
                map.zoomIn();
            };
            zoomOut.onclick = (e) => {
                e.preventDefault();
                map.zoomOut();
            };
            
            return div;
        };
        
        zoomControl.addTo(map);
    }

    // 添加全屏控件
    addFullscreenControl(map) {
        const fullscreenControl = L.control({position: 'topright'});
        fullscreenControl.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'leaflet-control-custom');
            div.style.cssText = `
                background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
                margin-top: 10px;
                border: 2px solid rgba(255, 255, 255, 0.3);
            `;
            
            const button = L.DomUtil.create('button', '', div);
            button.innerHTML = '⛶';
            button.title = '全屏';
            button.style.cssText = `
                background: transparent;
                border: none;
                padding: 8px;
                cursor: pointer;
                border-radius: 10px;
                font-size: 16px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: white;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            `;
            
            button.onmouseover = () => {
                button.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)';
                button.style.color = '#fff';
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = '0 0 20px rgba(255, 154, 158, 0.6)';
            };
            button.onmouseout = () => {
                button.style.background = 'transparent';
                button.style.color = 'white';
                button.style.transform = 'scale(1)';
                button.style.boxShadow = '';
            };
            button.onclick = () => this.toggleFullscreen(map);
            
            return div;
        };
        fullscreenControl.addTo(map);
    }

    // 添加定位控件
    addLocationControl(map) {
        const locationControl = L.control({position: 'topright'});
        locationControl.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'leaflet-control-location');
            div.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                margin-top: 10px;
                border: 2px solid rgba(255, 255, 255, 0.2);
            `;
            
            const button = L.DomUtil.create('button', '', div);
            button.innerHTML = '📍';
            button.title = '定位到所有城市';
            button.style.cssText = `
                background: transparent;
                border: none;
                padding: 8px;
                cursor: pointer;
                border-radius: 10px;
                font-size: 16px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: white;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            `;
            
            button.onmouseover = () => {
                button.style.background = 'linear-gradient(135deg, #f4d03f 0%, #f7dc6f 100%)';
                button.style.color = '#333';
                button.style.transform = 'scale(1.05)';
            };
            button.onmouseout = () => {
                button.style.background = 'transparent';
                button.style.color = 'white';
                button.style.transform = 'scale(1)';
            };
            button.onclick = () => {
                if (window.allMarkersGroup && window.allMarkersGroup.getLayers().length > 0) {
                    map.fitBounds(window.allMarkersGroup.getBounds(), { padding: [20, 20] });
                }
            };
            
            return div;
        };
        locationControl.addTo(map);
    }

    // 添加图层切换控件
    addLayerControl(map) {
        const layerControl = L.control({position: 'topright'});
        layerControl.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'leaflet-control-layers');
            div.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                margin-top: 10px;
                padding: 5px;
                border: 2px solid rgba(255, 255, 255, 0.2);
            `;
            
            const button = L.DomUtil.create('button', '', div);
            button.innerHTML = '🗺️';
            button.title = '切换地图样式';
            button.style.cssText = `
                background: transparent;
                border: none;
                padding: 8px;
                cursor: pointer;
                border-radius: 8px;
                font-size: 16px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: white;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            `;
            
            button.onmouseover = () => {
                button.style.background = 'linear-gradient(135deg, #f4d03f 0%, #f7dc6f 100%)';
                button.style.color = '#333';
                button.style.transform = 'scale(1.05)';
            };
            button.onmouseout = () => {
                button.style.background = 'transparent';
                button.style.color = 'white';
                button.style.transform = 'scale(1)';
            };
            button.onclick = () => this.toggleMapStyle(map);
            
            return div;
        };
        layerControl.addTo(map);
    }

    // 添加比例尺控件
    addScaleControl(map) {
        const scaleControl = L.control.scale({
            position: 'bottomright',
            metric: true,
            imperial: false,
            maxWidth: 200
        });
        
        scaleControl.addTo(map);
        
        // 自定义比例尺样式
        const scaleElement = document.querySelector('.leaflet-control-scale');
        if (scaleElement) {
            scaleElement.style.cssText = `
                background: rgba(255, 255, 255, 0.9);
                border-radius: 4px;
                padding: 5px 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                font-size: 12px;
                color: #333;
            `;
        }
    }

    // 添加地图交互功能增强
    addMapInteractionFeatures(map) {
        // 添加键盘快捷键支持
        this.addKeyboardShortcuts(map);
        
        // 添加鼠标滚轮增强
        this.enhanceScrollWheel(map);
        
        // 添加双击缩放增强
        this.enhanceDoubleClickZoom(map);
        
        // 添加右键菜单
        this.addContextMenu(map);
        
        // 添加地图状态显示
        this.addMapStatusDisplay(map);
    }

    // 添加键盘快捷键
    addKeyboardShortcuts(map) {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case '+':
                case '=':
                    e.preventDefault();
                    map.zoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    map.zoomOut();
                    break;
                case '0':
                    e.preventDefault();
                    map.setView([34.307, 108.934], 4);
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.toggleFullscreen(map);
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    if (window.allMarkersGroup && window.allMarkersGroup.getLayers().length > 0) {
                        map.fitBounds(window.allMarkersGroup.getBounds(), { padding: [20, 20] });
                    }
                    break;
            }
        });
    }

    // 增强鼠标滚轮
    enhanceScrollWheel(map) {
        let wheelTimeout;
        let wheelCount = 0;
        
        map.getContainer().addEventListener('wheel', (e) => {
            clearTimeout(wheelTimeout);
            wheelCount++;
            
            // 防抖处理
            wheelTimeout = setTimeout(() => {
                wheelCount = 0;
            }, 150);
            
            // 显示缩放提示
            this.showZoomHint(map, e.deltaY > 0 ? '缩小' : '放大');
        });
    }

    // 增强双击缩放
    enhanceDoubleClickZoom(map) {
        let clickTimeout;
        let clickCount = 0;
        
        map.on('click', (e) => {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimeout = setTimeout(() => {
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimeout);
                clickCount = 0;
                
                // 双击放大
                map.setView(e.latlng, map.getZoom() + 1);
                this.showZoomHint(map, '双击放大');
            }
        });
    }

    // 添加右键菜单
    addContextMenu(map) {
        map.on('contextmenu', (e) => {
            e.originalEvent.preventDefault();
            
            const contextMenu = document.createElement('div');
            contextMenu.className = 'map-context-menu';
            contextMenu.style.cssText = `
                position: fixed;
                left: ${e.originalEvent.clientX}px;
                top: ${e.originalEvent.clientY}px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                padding: 8px 0;
                z-index: 10000;
                min-width: 150px;
            `;
            
            const menuItems = [
                { text: '放大', action: () => map.zoomIn() },
                { text: '缩小', action: () => map.zoomOut() },
                { text: '重置视图', action: () => map.setView([34.307, 108.934], 4) },
                { text: '显示所有城市', action: () => {
                    if (window.allMarkersGroup && window.allMarkersGroup.getLayers().length > 0) {
                        map.fitBounds(window.allMarkersGroup.getBounds(), { padding: [20, 20] });
                    }
                }}
            ];
            
            menuItems.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.textContent = item.text;
                menuItem.style.cssText = `
                    padding: 8px 16px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                `;
                menuItem.onmouseover = () => menuItem.style.background = '#f0f0f0';
                menuItem.onmouseout = () => menuItem.style.background = 'white';
                menuItem.onclick = () => {
                    item.action();
                    contextMenu.remove();
                };
                contextMenu.appendChild(menuItem);
            });
            
            document.body.appendChild(contextMenu);
            
            // 点击其他地方关闭菜单
            const closeMenu = (e) => {
                if (!contextMenu.contains(e.target)) {
                    contextMenu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            setTimeout(() => document.addEventListener('click', closeMenu), 100);
        });
    }

    // 添加地图状态显示
    addMapStatusDisplay(map) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'map-status';
        statusDiv.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
        `;
        
        document.getElementById('map').appendChild(statusDiv);
        
        const updateStatus = () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            statusDiv.textContent = `缩放: ${zoom} | 中心: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
        };
        
        map.on('moveend', updateStatus);
        map.on('zoomend', updateStatus);
        updateStatus();
    }

    // 显示缩放提示
    showZoomHint(map, action) {
        const hint = document.createElement('div');
        hint.textContent = action;
        hint.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            pointer-events: none;
            animation: zoomHint 1s ease-out forwards;
        `;
        
        // 添加动画样式
        if (!document.querySelector('#zoom-hint-style')) {
            const style = document.createElement('style');
            style.id = 'zoom-hint-style';
            style.textContent = `
                @keyframes zoomHint {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.getElementById('map').appendChild(hint);
        
        setTimeout(() => {
            if (hint.parentNode) {
                hint.parentNode.removeChild(hint);
            }
        }, 1000);
    }

    // 切换地图样式
    toggleMapStyle(map) {
        if (!this.mapLayers) {
            this.mapLayers = {
                current: 0,
                layers: [
                    {
                        name: '标准地图',
                        layer: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            maxZoom: 19,
                            attribution: ''
                        })
                    },
                    {
                        name: '卫星地图',
                        layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                            maxZoom: 19,
                            attribution: ''
                        })
                    },
                    {
                        name: '地形地图',
                        layer: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                            maxZoom: 17,
                            attribution: ''
                        })
                    }
                ]
            };
        }
        
        // 移除当前图层
        map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });
        
        // 切换到下一个图层
        this.mapLayers.current = (this.mapLayers.current + 1) % this.mapLayers.layers.length;
        const newLayer = this.mapLayers.layers[this.mapLayers.current];
        
        newLayer.layer.addTo(map);
        
        // 显示切换提示
        this.showZoomHint(map, `切换到${newLayer.name}`);
    }

    // 全屏切换
    toggleFullscreen(map) {
        const mapContainer = document.getElementById('map');
        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().then(() => {
                setTimeout(() => map.invalidateSize(), 100);
                this.showZoomHint(map, '进入全屏模式');
            });
        } else {
            document.exitFullscreen().then(() => {
                setTimeout(() => map.invalidateSize(), 100);
                this.showZoomHint(map, '退出全屏模式');
            });
        }
    }

    // 创建增强版筛选按钮
    createEnhancedFilters(cities, map, markers, allMarkers) {
        const filterEl = document.getElementById('map-filters');
        if (!filterEl) return;

        const types = [...new Set(cities.map(c => c.type))];
        const typeIcons = {
            '历史': '🏛️',
            '现代': '🏙️',
            '文化': '🎭',
            '生活': '🏠',
            '自然': '🌿'
        };

        filterEl.innerHTML = `
            <button class="filter-btn active" data-type="all" onclick="window.filterMapByType('all')">
                🌍 全部 (${cities.length})
            </button>
            ${types.map(t => `
                <button class="filter-btn" data-type="${t}" onclick="window.filterMapByType('${t}')">
                    ${typeIcons[t] || '📍'} ${t} (${cities.filter(c => c.type === t).length})
                </button>
            `).join('')}
        `;
    }

    // 增强版筛选函数
    filterMapByType(type, map, markers, allMarkers, cities) {
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        // 筛选标记
        markers.clearLayers();
        const filteredMarkers = type === 'all' 
            ? allMarkers 
            : allMarkers.filter(c => c.type === type);
            
        filteredMarkers.forEach(c => markers.addLayer(c.marker));
        
        // 更新统计信息
        this.updateMapStats(cities, type);
        
        // 调整地图视图
        if (filteredMarkers.length > 0) {
            const group = new L.featureGroup(filteredMarkers.map(c => c.marker));
            map.fitBounds(group.getBounds().pad(0.1));
        }
        
        // 添加筛选动画
        this.animateFilterTransition();
    }

    // 更新地图统计信息
    updateMapStats(cities, currentFilter) {
        const totalCitiesEl = document.getElementById('total-cities');
        const totalTypesEl = document.getElementById('total-types');
        const currentFilterEl = document.getElementById('current-filter');
        
        if (totalCitiesEl) {
            this.animateNumber(totalCitiesEl, cities.length);
        }
        if (totalTypesEl) {
            const types = [...new Set(cities.map(c => c.type))];
            this.animateNumber(totalTypesEl, types.length);
        }
        if (currentFilterEl) {
            currentFilterEl.textContent = currentFilter;
        }
    }

    // 数字动画
    animateNumber(element, targetNumber) {
        const startNumber = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentNumber = Math.round(startNumber + (targetNumber - startNumber) * progress);
            element.textContent = currentNumber;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // 筛选过渡动画
    animateFilterTransition() {
        const mapEl = document.getElementById('map');
        mapEl.style.transform = 'scale(0.98)';
        mapEl.style.opacity = '0.8';
        
        setTimeout(() => {
            mapEl.style.transform = 'scale(1)';
            mapEl.style.opacity = '1';
        }, 150);
    }

    // 显示城市详情
    showCityDetails(city) {
        const modal = document.createElement('div');
        modal.className = 'city-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div class="modal-header">
                    <h2>${city.name}</h2>
                    <span class="city-type-badge">${city.type}</span>
                </div>
                <div class="modal-body">
                    <p>${city.story}</p>
                    <div class="city-info">
                        <div class="info-item">
                            <strong>坐标：</strong> ${city.coords[0].toFixed(4)}, ${city.coords[1].toFixed(4)}
                        </div>
                        <div class="info-item">
                            <strong>类型：</strong> ${city.type}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 关闭模态框
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 添加地图事件监听
    addMapEventListeners(map, markers, allMarkers) {
        // 地图缩放事件
        map.on('zoomend', () => {
            const zoom = map.getZoom();
            console.log('地图缩放级别:', zoom);
        });
        
        // 地图移动事件
        map.on('moveend', () => {
            const center = map.getCenter();
            console.log('地图中心:', center);
        });
    }

    setupFallbackMap() {
        console.log('使用备用地图实现...');
        try {
            const mapEl = document.getElementById('map');
            if (mapEl) {
                mapEl.innerHTML = '';
            }
            
            const map = L.map('map', {
                scrollWheelZoom: false,
                zoomControl: true
            }).setView([34.307, 108.934], 4);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
                attribution: '' 
            }).addTo(map);
            
            // 添加一些默认城市标记
            const defaultCities = [
                { name: '北京', coords: [39.9042, 116.4074], story: '历史文化之都', type: '历史' },
                { name: '上海', coords: [31.2304, 121.4737], story: '外滩夜景与海派文化', type: '现代' },
                { name: '广州', coords: [23.1291, 113.2644], story: '岭南饮食与音乐的活力', type: '文化' }
            ];
            
            defaultCities.forEach(city => {
                L.marker(city.coords)
                    .addTo(map)
                    .bindPopup(`<b>${city.name}</b><br>${city.story}<br><em>${city.type}</em>`);
            });
            
            setTimeout(() => {
                map.invalidateSize();
                console.log('备用地图初始化完成');
            }, 200);
        } catch (err) {
            console.error('备用地图初始化也失败了:', err);
        }
    }

    applyTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');
        
        if (this.currentTheme === 'dark') {
            body.classList.add('dark-theme');
            themeIcon.textContent = '🌙';
            // 更新页面标题以反映当前主题
            document.documentElement.setAttribute('data-theme', 'dark');
            // 强制应用暗黑模式样式
            this.applyDarkThemeStyles();
        } else {
            body.classList.remove('dark-theme');
            themeIcon.textContent = '☀️';
            document.documentElement.setAttribute('data-theme', 'light');
            // 强制应用浅色模式样式
            this.applyLightThemeStyles();
        }
    }

    // 添加主题切换过渡效果
    addThemeTransitionEffect() {
        const body = document.body;
        
        // 添加过渡类
        body.classList.add('theme-transitioning');
        
        // 强制应用主题样式到所有文本元素
        this.forceApplyThemeStyles();
        
        // 300ms后移除过渡类
        setTimeout(() => {
            body.classList.remove('theme-transitioning');
        }, 300);
    }

    // 强制应用主题样式到所有文本元素
    forceApplyThemeStyles() {
        if (this.currentTheme === 'dark') {
            // 强制应用暗黑模式样式
            this.applyDarkThemeStyles();
        } else {
            // 强制应用浅色模式样式
            this.applyLightThemeStyles();
        }
    }

    // 强制应用暗黑模式样式
    applyDarkThemeStyles() {
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, span, div, article, section');
        const cardElements = document.querySelectorAll('.card, article, .case-study, .features-list li, .team-member, .testimonial-card, blockquote');
        
        // 应用文本颜色
        textElements.forEach(element => {
            if (element.tagName.match(/^H[1-6]$/)) {
                element.style.color = '#ffffff';
            } else if (element.tagName === 'STRONG' || element.tagName === 'B' || element.tagName === 'EM') {
                element.style.color = '#74b9ff';
            } else if (element.tagName === 'A') {
                element.style.color = '#74b9ff';
            } else {
                element.style.color = '#e0e0e0';
            }
        });
        
        // 应用背景颜色 - 更全面的覆盖
        cardElements.forEach(element => {
            if (element.classList.contains('case-study')) {
                element.style.backgroundColor = '#1a1a1a';
            } else {
                element.style.backgroundColor = '#2c2c2c';
            }
            element.style.borderColor = '#444';
            element.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        });
        
        // 强制覆盖所有可能的白色背景 - 检查计算样式
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const bgColor = computedStyle.backgroundColor;
            
            // 检查是否是白色或浅色背景
            if (bgColor.includes('rgb(255, 255, 255)') || 
                bgColor.includes('rgb(248, 249, 250)') || 
                bgColor.includes('rgb(236, 240, 241)') ||
                bgColor.includes('rgb(232, 244, 253)') ||
                bgColor.includes('rgb(241, 248, 251)')) {
                
                if (element.classList.contains('case-study')) {
                    element.style.backgroundColor = '#1a1a1a';
                } else if (element.classList.contains('card') || element.classList.contains('article')) {
                    element.style.backgroundColor = '#2c2c2c';
                } else if (element.classList.contains('features-list') || element.classList.contains('team-member') || element.classList.contains('testimonial-card')) {
                    element.style.backgroundColor = '#2c2c2c';
                }
            }
        });
    }

    // 强制应用浅色模式样式
    applyLightThemeStyles() {
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, span, div, article, section');
        const cardElements = document.querySelectorAll('.card, article, .case-study, .features-list li, .team-member, .testimonial-card, blockquote');
        
        // 恢复文本颜色
        textElements.forEach(element => {
            element.style.color = '';
        });
        
        // 恢复背景颜色
        cardElements.forEach(element => {
            element.style.backgroundColor = '';
            element.style.borderColor = '';
            element.style.boxShadow = '';
        });
    }

    // 动态打字机标题
    setupTypingEffect() {
        const titleElement = document.getElementById('typing-title');
        if (!titleElement) return;

        // 为每个文本配置对应的背景色
        this.typingBackgrounds = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 蓝紫渐变
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // 粉红渐变
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // 蓝色渐变
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // 绿色渐变
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // 粉金渐变
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'  // 青粉渐变
        ];

        this.typeText(titleElement);
    }

    typeText(element) {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const text = this.typingTexts[this.currentTextIndex];
        const background = this.typingBackgrounds[this.currentTextIndex];
        let index = 0;
        
        // 切换背景色
        this.changeHeroBackground(background);
        
        const typeInterval = setInterval(() => {
            element.textContent = text.substring(0, index);
            index++;
            
            if (index > text.length) {
                clearInterval(typeInterval);
                this.isTyping = false;
                
                // 等待一段时间后切换到下一个文本
                setTimeout(() => {
                    this.currentTextIndex = (this.currentTextIndex + 1) % this.typingTexts.length;
                    this.typeText(element);
                }, 2000);
            }
        }, 100);
    }

    // 切换hero区域背景色
    changeHeroBackground(background) {
        const hero = document.getElementById('hero');
        if (hero) {
            hero.style.background = background;
            hero.style.transition = 'background 1s ease-in-out';
        }
    }

    // 音乐作品展示
    setupMusicWorks() {
        // 模拟音乐作品数据
        this.musicWorks = [
            {
                id: 1,
                title: "巴赫平均律钢琴曲集",
                description: "古典音乐的巅峰之作，展现了复调音乐的完美结构",
                genre: "古典",
                language: "德语",
                tags: ["钢琴", "复调", "巴赫"]
            },
            {
                id: 2,
                title: "爵士即兴演奏",
                description: "自由奔放的爵士乐，展现即兴创作的魅力",
                genre: "爵士",
                language: "英语",
                tags: ["即兴", "萨克斯", "爵士"]
            },
            {
                id: 3,
                title: "流行音乐创作",
                description: "现代流行音乐，融合多种音乐元素",
                genre: "流行",
                language: "中文",
                tags: ["流行", "创作", "现代"]
            },
            {
                id: 4,
                title: "世界音乐融合",
                description: "融合东西方音乐文化，创造独特的音乐体验",
                genre: "融合",
                language: "多语言",
                tags: ["融合", "世界音乐", "文化"]
            }
        ];

        this.renderFilterButtons();
        this.renderMusicWorks();
    }

    renderFilterButtons() {
        const filterContainer = document.getElementById('filter-buttons');
        if (!filterContainer) return;

        filterContainer.innerHTML = ''; // 清空旧按钮

        // 获取所有音乐类型
        const genres = [...new Set(this.musicWorks.map(work => work.genre))];
        
        // 添加"全部"按钮
        const allButton = document.createElement('button');
        allButton.textContent = '全部';
        allButton.className = 'filter-button active';
        allButton.type = 'button';
        allButton.dataset.genre = 'all';
        allButton.addEventListener('click', (e) => this.filterWorks('all', e));
        filterContainer.appendChild(allButton);

        // 添加其他筛选按钮
        genres.forEach(genre => {
            const button = document.createElement('button');
            button.textContent = genre;
            button.className = 'filter-button';
            button.type = 'button';
            button.dataset.genre = genre;
            button.addEventListener('click', (e) => this.filterWorks(genre, e));
            filterContainer.appendChild(button);
        });
    }

    renderMusicWorks(filteredWorks = null) {
        const worksContainer = document.getElementById('works-grid');
        if (!worksContainer) return;

        const worksToRender = filteredWorks || this.musicWorks;
        
        // 加入淡出动画
        worksContainer.style.opacity = '0';
        worksContainer.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // 渲染卡片
            if (worksToRender.length === 0) {
                worksContainer.innerHTML = `
                    <div class="works-empty">
                        <p>暂无该类型的音乐作品，敬请期待~</p>
                        <p style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">
                            可以尝试选择其他音乐类型，或者稍后再来看看
                        </p>
                    </div>
                `;
            } else {
                worksContainer.innerHTML = worksToRender.map(work => `
                    <div class="work-card" data-genre="${work.genre}">
                        <h3>${work.title}</h3>
                        <p>${work.description}</p>
                        <div class="work-tags">
                            ${work.tags.map(tag => `<span class="work-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                `).join('');
            }
            
            // 加入淡入动画
            worksContainer.style.opacity = '1';
            worksContainer.style.transform = 'scale(1)';
        }, 200);
    }

    filterWorks(genre, event) {
        // 更新按钮状态
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // 筛选作品
        let filteredWorks;
        if (genre === 'all') {
            filteredWorks = this.musicWorks;
        } else {
            filteredWorks = this.musicWorks.filter(work => work.genre === genre);
        }

        // 添加更流畅的过渡动画
        const worksContainer = document.getElementById('works-grid');
        worksContainer.style.opacity = '0';
        worksContainer.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.renderMusicWorks(filteredWorks);
        }, 200);
    }

    // Konami Code 彩蛋
    setupKonamiCode() {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        let konamiIndex = 0;

        document.addEventListener('keydown', (e) => {
            if (e.code === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    this.triggerKonamiCode();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }

    triggerKonamiCode() {
        // 启动音乐节拍大师小游戏
        const game = new MusicBeatMasterGame();
        game.startMusicBeatMasterGame();
    }

    showVisualEasterEgg() {
        const body = document.body;
        body.style.animation = 'rainbow 2s infinite';
        
        // 创建彩虹动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            body.style.animation = '';
            style.remove();
        }, 4000);
    }

    // 音符雨动画
    createNoteRain() {
        const notes = ['♪', '♩', '♫', '♬', '𝄞', '𝄢'];
        const container = document.createElement('div');
        container.className = 'note-rain-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            overflow: hidden;
        `;
        document.body.appendChild(container);

        // 创建音符雨样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes noteRain {
                0% {
                    transform: translateY(-100px) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // 生成音符
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const note = document.createElement('div');
                note.className = 'note-raindrop';
                note.textContent = notes[Math.floor(Math.random() * notes.length)];
                note.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    top: -50px;
                    font-size: ${20 + Math.random() * 30}px;
                    color: ${['#667eea', '#764ba2', '#f4d03f', '#e74c3c', '#2ecc71'][Math.floor(Math.random() * 5)]};
                    animation: noteRain ${3 + Math.random() * 2}s linear forwards;
                    opacity: 0;
                    transform: rotate(${Math.random() * 360}deg);
                `;
                container.appendChild(note);
            }, i * 100);
        }

        // 4秒后清理
        setTimeout(() => {
            container.remove();
            style.remove();
        }, 4000);
    }

    // 五线谱波动动画
    createStaffWave() {
        const container = document.createElement('div');
        container.className = 'staff-wave-container';
        container.style.cssText = `
            position: fixed;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 120px;
            pointer-events: none;
            z-index: 9997;
        `;
        document.body.appendChild(container);

        // 创建SVG五线谱
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '300');
        svg.setAttribute('height', '120');
        svg.style.cssText = `
            width: 100%;
            height: 100%;
        `;

        // 创建五条线
        for (let i = 0; i < 5; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '20');
            line.setAttribute('y1', 30 + i * 15);
            line.setAttribute('x2', '280');
            line.setAttribute('y2', 30 + i * 15);
            line.setAttribute('stroke', '#667eea');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('class', 'staff-line');
            svg.appendChild(line);
        }

        // 添加音符
        const note = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        note.setAttribute('x', '250');
        note.setAttribute('y', '45');
        note.setAttribute('font-size', '24');
        note.setAttribute('fill', '#764ba2');
        note.textContent = '♪';
        note.setAttribute('class', 'staff-note');
        svg.appendChild(note);

        container.appendChild(svg);

        // 添加波动动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes staffWave {
                0%, 100% {
                    transform: translateX(0);
                }
                25% {
                    transform: translateX(5px);
                }
                50% {
                    transform: translateX(-3px);
                }
                75% {
                    transform: translateX(4px);
                }
            }
            
            .staff-line {
                animation: staffWave 0.8s ease-in-out infinite;
            }
            
            .staff-line:nth-child(1) { animation-delay: 0s; }
            .staff-line:nth-child(2) { animation-delay: 0.1s; }
            .staff-line:nth-child(3) { animation-delay: 0.2s; }
            .staff-line:nth-child(4) { animation-delay: 0.3s; }
            .staff-line:nth-child(5) { animation-delay: 0.4s; }
            
            .staff-note {
                animation: staffWave 1.2s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);

        // 4秒后清理
        setTimeout(() => {
            container.remove();
            style.remove();
        }, 4000);
    }

    // 页面可见性彩蛋
    setupPageVisibility() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.title = '别走呀，快回来！🎵';
            } else {
                document.title = '音乐盛宴 - 音乐家的艺术天地';
            }
        });
    }

    /**
     * 高性能自定义光标系统 - 音乐主题设计
     * 使用 requestAnimationFrame 和 transform3d 实现低延迟跟随
     */
    setupCustomCursor() {
        // 创建主光标和跟随光标
        this.createCursorElements();
        
        // 初始化光标状态
        this.cursorState = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            isHovering: false,
            isVisible: false
        };

        // 绑定事件监听器
        this.bindCursorEvents();
        
        // 启动动画循环
        this.startCursorAnimation();
    }

    /**
     * 创建光标元素
     */
    createCursorElements() {
        // 主光标
        this.mainCursor = document.createElement('div');
        this.mainCursor.className = 'custom-cursor-main';
        this.mainCursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transform: translate3d(-50%, -50%, 0);
            will-change: transform;
            mix-blend-mode: difference;
            box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
            border: 2px solid rgba(255, 255, 255, 0.3);
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.1s ease;
        `;

        // 跟随光标
        this.followCursor = document.createElement('div');
        this.followCursor.className = 'custom-cursor-follow';
        this.followCursor.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            transform: translate3d(-50%, -50%, 0);
            will-change: transform;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.2s ease;
        `;

        document.body.appendChild(this.mainCursor);
        document.body.appendChild(this.followCursor);
    }

    /**
     * 绑定光标事件
     */
    bindCursorEvents() {
        // 使用 passive: true 提高性能
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
        document.addEventListener('mouseenter', this.handleMouseEnter.bind(this), { passive: true });
        document.addEventListener('mouseleave', this.handleMouseLeave.bind(this), { passive: true });
        
        // 悬停效果
        document.addEventListener('mouseover', this.handleMouseOver.bind(this), { passive: true });
        document.addEventListener('mouseout', this.handleMouseOut.bind(this), { passive: true });
    }

    /**
     * 处理鼠标移动 - 使用节流优化性能
     */
    handleMouseMove(e) {
        this.cursorState.targetX = e.clientX;
        this.cursorState.targetY = e.clientY;
        
        if (!this.cursorState.isVisible) {
            this.cursorState.isVisible = true;
            this.showCursors();
        }
    }

    /**
     * 处理鼠标进入页面
     */
    handleMouseEnter() {
        this.cursorState.isVisible = true;
        this.showCursors();
    }

    /**
     * 处理鼠标离开页面
     */
    handleMouseLeave() {
        this.cursorState.isVisible = false;
        this.hideCursors();
    }

    /**
     * 处理悬停效果
     */
    handleMouseOver(e) {
        const target = e.target;
        if (this.isInteractiveElement(target)) {
            this.cursorState.isHovering = true;
            this.applyHoverEffect();
        }
    }

    /**
     * 处理离开悬停
     */
    handleMouseOut(e) {
        this.cursorState.isHovering = false;
        this.removeHoverEffect();
    }

    /**
     * 判断是否为交互元素
     */
    isInteractiveElement(element) {
        return element.tagName === 'A' || 
               element.tagName === 'BUTTON' || 
               element.closest('a') || 
               element.closest('button') ||
               element.classList.contains('interactive') ||
               element.onclick !== null;
    }

    /**
     * 显示光标
     */
    showCursors() {
        this.mainCursor.style.opacity = '1';
        this.followCursor.style.opacity = '0.6';
    }

    /**
     * 隐藏光标
     */
    hideCursors() {
        this.mainCursor.style.opacity = '0';
        this.followCursor.style.opacity = '0';
    }

    /**
     * 应用悬停效果
     */
    applyHoverEffect() {
        this.mainCursor.style.transform = 'translate3d(-50%, -50%, 0) scale(1.5) rotate(180deg)';
        this.mainCursor.style.background = 'linear-gradient(135deg, #f4d03f 0%, #f7dc6f 100%)';
        this.mainCursor.style.boxShadow = '0 0 20px rgba(244, 208, 63, 0.8)';
        this.mainCursor.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        
        this.followCursor.style.transform = 'translate3d(-50%, -50%, 0) scale(1.2)';
        this.followCursor.style.background = 'linear-gradient(135deg, rgba(244, 208, 63, 0.4) 0%, rgba(247, 220, 111, 0.4) 100%)';
    }

    /**
     * 移除悬停效果
     */
    removeHoverEffect() {
        this.mainCursor.style.transform = 'translate3d(-50%, -50%, 0) scale(1) rotate(0deg)';
        this.mainCursor.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        this.mainCursor.style.boxShadow = '0 0 10px rgba(102, 126, 234, 0.5)';
        this.mainCursor.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        
        this.followCursor.style.transform = 'translate3d(-50%, -50%, 0) scale(1)';
        this.followCursor.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)';
    }

    /**
     * 启动光标动画循环
     */
    startCursorAnimation() {
        const animate = () => {
            if (this.cursorState.isVisible) {
                // 使用缓动函数实现平滑跟随
                const ease = 0.15;
                this.cursorState.x += (this.cursorState.targetX - this.cursorState.x) * ease;
                this.cursorState.y += (this.cursorState.targetY - this.cursorState.y) * ease;

                // 主光标立即跟随
                this.mainCursor.style.transform = `translate3d(${this.cursorState.targetX}px, ${this.cursorState.targetY}px, 0) scale(${this.cursorState.isHovering ? 1.5 : 1}) rotate(${this.cursorState.isHovering ? 180 : 0}deg)`;
                
                // 跟随光标平滑跟随
                this.followCursor.style.transform = `translate3d(${this.cursorState.x}px, ${this.cursorState.y}px, 0) scale(${this.cursorState.isHovering ? 1.2 : 1})`;
            }
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 性能优化设置
     */
    setupPerformanceOptimizations() {
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 设置资源提示
        this.setupResourceHints();
        
        // 图片懒加载
        this.setupLazyLoading();
        
        // 性能监控
        this.setupPerformanceMonitoring();
        
        // 内存管理
        this.setupMemoryManagement();
    }

    /**
     * 预加载关键资源
     */
    preloadCriticalResources() {
        const criticalResources = [
            'css/main.css',
            'images/鸡哥肖像权.jpg',
            'images/always.png'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'image';
            document.head.appendChild(link);
        });
    }

    /**
     * 设置资源提示
     */
    setupResourceHints() {
        // DNS 预解析
        const dnsPrefetch = ['//fonts.googleapis.com', '//cdn.jsdelivr.net'];
        dnsPrefetch.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });

        // 预连接
        const preconnect = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
        preconnect.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    /**
     * 图片懒加载
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * 性能监控
     */
    setupPerformanceMonitoring() {
        // 监控页面加载性能
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
                
                console.log(`页面加载时间: ${loadTime}ms`);
                console.log(`DOM内容加载时间: ${domContentLoaded}ms`);
                
                // 如果加载时间过长，可以发送到分析服务
                if (loadTime > 3000) {
                    this.reportPerformanceIssue('slow_load', loadTime);
                }
            }, 0);
        });

        // 监控长任务
        if ('PerformanceObserver' in window) {
            const longTaskObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) {
                        console.warn('检测到长任务:', entry.duration, 'ms');
                    }
                });
            });
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
    }

    /**
     * 内存管理
     */
    setupMemoryManagement() {
        // 清理事件监听器
        this.eventListeners = new Set();
        
        // 页面卸载时清理资源
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 清理事件监听器
        if (this.eventListeners) {
            this.eventListeners.forEach(listener => {
                document.removeEventListener(listener.type, listener.handler);
            });
            this.eventListeners.clear();
        }
        
        // 清理动画帧
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        if (this.particleAnimationId) {
            cancelAnimationFrame(this.particleAnimationId);
        }
        
        // 清理定时器
        if (this.timers) {
            this.timers.forEach(timer => clearTimeout(timer));
            this.timers = [];
        }
        
        // 清理粒子背景
        if (this.particleCanvas && this.particleCanvas.parentNode) {
            this.particleCanvas.parentNode.removeChild(this.particleCanvas);
        }
        
        // 清理自定义光标
        if (this.mainCursor && this.mainCursor.parentNode) {
            this.mainCursor.parentNode.removeChild(this.mainCursor);
        }
        
        if (this.followCursor && this.followCursor.parentNode) {
            this.followCursor.parentNode.removeChild(this.followCursor);
        }
        
        // 清理音乐装饰元素
        if (this.musicDecorations) {
            this.musicDecorations.forEach(decoration => {
                if (decoration.parentNode) {
                    decoration.parentNode.removeChild(decoration);
                }
            });
            this.musicDecorations = [];
        }
        
        // 清理窗口事件监听器
        if (this.debouncedResize) {
            window.removeEventListener('resize', this.debouncedResize);
        }
    }

    /**
     * 报告性能问题
     */
    reportPerformanceIssue(type, value) {
        // 这里可以发送到性能监控服务
        console.warn(`性能问题: ${type} = ${value}`);
    }

    /**
     * 音乐装饰元素 - 性能优化版本
     */
    setupMusicDecorations() {
        const musicSymbols = ['♪', '♩', '♫', '♬', '𝄞', '𝄢'];
        const hero = document.getElementById('hero');
        
        if (!hero) return;
        
        // 使用 DocumentFragment 减少DOM操作
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < 8; i++) {
            const decoration = document.createElement('div');
            decoration.className = 'music-decoration';
            decoration.textContent = musicSymbols[Math.floor(Math.random() * musicSymbols.length)];
            
            // 使用CSS变量和transform3d优化性能
            decoration.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                font-size: ${1 + Math.random() * 2}rem;
                animation-delay: ${Math.random() * 3}s;
                animation-duration: ${2 + Math.random() * 2}s;
                transform: translate3d(0, 0, 0);
                will-change: transform;
            `;
            
            fragment.appendChild(decoration);
            this.musicDecorations.push(decoration);
        }
        
        hero.appendChild(fragment);
    }

    // 平滑滚动
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // 交叉观察器 - 动画触发
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    // 为卡片添加延迟动画
                    if (entry.target.classList.contains('project-card') || 
                        entry.target.classList.contains('hobby-category')) {
                        entry.target.style.animationDelay = '0.2s';
                        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                    }
                }
            });
        }, observerOptions);

        // 观察所有卡片和section
        document.querySelectorAll('.project-card, .hobby-category, .performance-item, section').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    // 兴趣爱好展开功能
    setupHobbyExpansion() {
        const hobbyCategories = document.querySelectorAll('.hobby-category');
        
        hobbyCategories.forEach(hobby => {
            hobby.addEventListener('click', () => {
                // 切换展开状态
                hobby.classList.toggle('expanded');
                
                // 添加点击反馈动画
                hobby.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    hobby.style.transform = 'scale(1)';
                }, 150);
                
                // 更新aria属性
                const isExpanded = hobby.classList.contains('expanded');
                hobby.setAttribute('aria-expanded', isExpanded);
                
                // 添加展开提示
                if (isExpanded) {
                    this.showExpansionHint(hobby);
                }
            });
            
            // 设置初始aria属性
            hobby.setAttribute('aria-expanded', 'false');
            hobby.setAttribute('role', 'button');
            hobby.setAttribute('tabindex', '0');
        });
    }

    // 显示展开提示
    showExpansionHint(hobby) {
        const hint = document.createElement('div');
        hint.className = 'expansion-hint';
        hint.textContent = '点击收起';
        hint.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(102, 126, 234, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            opacity: 0;
            animation: fadeIn 0.3s ease forwards;
        `;
        
        hobby.appendChild(hint);
        
        setTimeout(() => {
            hint.remove();
        }, 2000);
    }

    /**
     * 高性能粒子背景效果
     */
    setupParticleBackground() {
        // 在移动端或低性能设备上关闭粒子背景
        if (window.innerWidth <= 768 || !this.isDeviceCapable()) {
            return;
        }

        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -2;
            opacity: 0.15;
        `;
        document.body.appendChild(this.particleCanvas);

        this.particleCtx = this.particleCanvas.getContext('2d');
        this.resizeCanvas();

        // 优化粒子数量
        this.particles = [];
        const particleCount = Math.min(25, Math.floor(window.innerWidth / 50));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: Math.random() * this.particleCanvas.height,
                size: Math.random() * 1.2 + 0.3,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.2 + 0.05
            });
        }

        // 使用节流优化动画循环
        this.particleAnimationId = null;
        this.startParticleAnimation();

        // 优化窗口大小改变事件
        this.debouncedResize = this.debounce(() => {
            this.resizeCanvas();
        }, 250);
        
        window.addEventListener('resize', this.debouncedResize);
    }

    /**
     * 检测设备性能
     */
    isDeviceCapable() {
        // 检测是否为低性能设备
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        return memory >= 4 && cores >= 4;
    }

    /**
     * 调整画布大小
     */
    resizeCanvas() {
        if (!this.particleCanvas) return;
        
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
    }

    /**
     * 启动粒子动画
     */
    startParticleAnimation() {
        const animate = () => {
            if (!this.particleCtx || !this.particleCanvas) return;
            
            this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
            
            this.particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // 边界检查
                if (particle.x > this.particleCanvas.width) particle.x = 0;
                if (particle.x < 0) particle.x = this.particleCanvas.width;
                if (particle.y > this.particleCanvas.height) particle.y = 0;
                if (particle.y < 0) particle.y = this.particleCanvas.height;
                
                // 批量绘制优化
                this.particleCtx.beginPath();
                this.particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.particleCtx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`;
                this.particleCtx.fill();
            });
            
            this.particleAnimationId = requestAnimationFrame(animate);
        };
        
        this.particleAnimationId = requestAnimationFrame(animate);
    }

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 页面切换动画
    setupPageTransitions() {
        // 创建页面切换遮罩
        const transitionOverlay = document.createElement('div');
        transitionOverlay.id = 'page-transition-overlay';
        transitionOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(transitionOverlay);

        // 为所有内部链接添加页面切换效果
        const internalLinks = document.querySelectorAll('a[href^="./"], a[href^="/"], a[href^="index.html"], a[href^="about.html"], a[href^="products.html"], a[href^="services.html"], a[href^="contact.html"]');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('http')) {
                    e.preventDefault();
                    this.triggerPageTransition(href);
                }
            });
        });
    }

    // 触发页面切换动画
    triggerPageTransition(targetUrl) {
        const overlay = document.getElementById('page-transition-overlay');
        if (!overlay) return;

        // 显示过渡动画
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';

        // 添加加载动画
        overlay.innerHTML = `
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: white;
            ">
                <div class="loading-spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top: 3px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p>正在加载...</p>
            </div>
        `;

        // 延迟跳转以显示动画
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 500);
    }

    // 导航高亮功能
    setupNavigationHighlight() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 页面加载进度条
    setupLoadingProgress() {
        // 创建顶部进度条
        const progressBar = document.createElement('div');
        progressBar.id = 'loading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            z-index: 10000;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(progressBar);

        // 页面加载时显示进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                progress = 90;
                clearInterval(interval);
            }
            progressBar.style.width = progress + '%';
        }, 100);

        // 页面完全加载后完成进度条
        window.addEventListener('load', () => {
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressBar.style.opacity = '0';
                setTimeout(() => {
                    progressBar.remove();
                }, 300);
            }, 200);
        });
    }

    // 按钮动效增强
    setupButtonEffects() {
        // 为所有按钮添加ripple类
        const buttons = document.querySelectorAll('.cta-button, .submit-btn, button[type="submit"]');
        buttons.forEach(button => {
            button.classList.add('ripple');
        });

        // 添加键盘支持
        buttons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    // 设置支付链接效果
    setupPaymentEffects() {
        const paymentLinks = document.querySelectorAll('.payment-link');
        
        paymentLinks.forEach(link => {
            // 添加点击动画
            link.addEventListener('click', (e) => {
                // 创建点击效果
                const clickEffect = document.createElement('div');
                clickEffect.style.cssText = `
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(244, 208, 63, 0.4) 0%, transparent 70%);
                    border-radius: 8px;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                    animation: paymentClick 0.6s ease-out forwards;
                `;
                
                link.style.position = 'relative';
                link.appendChild(clickEffect);
                
                setTimeout(() => {
                    clickEffect.remove();
                }, 600);
                
                // 显示支付提示
                this.showPaymentSuccess();
            });
            
            // 添加悬停效果
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-2px) scale(1.02)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // 显示支付成功提示
    showPaymentSuccess() {
        const successToast = document.createElement('div');
        successToast.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: slideInRight 0.5s ease-out;
            ">
                <span style="font-size: 1.2em;">✅</span>
                正在跳转到支付界面...
            </div>
        `;
        
        document.body.appendChild(successToast);
        
        setTimeout(() => {
            successToast.style.animation = 'slideOutRight 0.5s ease-in forwards';
            setTimeout(() => {
                successToast.remove();
            }, 500);
        }, 2000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    projectManager = new ProjectManager();
    skillVisualizer = new SkillVisualizer();
    timelineManager = new TimelineManager();
    blogSystem = new BlogSystem();
    new MusicWebsite();
    // 加载 GitHub 项目列表
    projectManager.fetchProjects();
    // 初始化技能可视化与时间轴
    skillVisualizer.initSkillBars();
    timelineManager.initTimeline();
});

// 音乐节拍大师游戏类
class MusicBeatMasterGame {
    constructor() {
        this.gameContainer = null;
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lives = 3;
        this.level = 1;
        this.beatNotes = [];
        this.beatIndex = 0;
        this.animationId = null;
        this.gameTime = 0;
        this.bpm = 120;
        this.beatInterval = 60000 / this.bpm; // 毫秒
        this.lastBeatTime = 0;
        this.particles = [];
        this.backgroundStars = [];
        this.musicTracks = [
            { name: "古典交响", bpm: 120, color: "#8B5CF6", notes: this.generateClassicalPattern() },
            { name: "爵士摇摆", bpm: 140, color: "#F59E0B", notes: this.generateJazzPattern() },
            { name: "电子节拍", bpm: 160, color: "#10B981", notes: this.generateElectronicPattern() },
            { name: "摇滚激情", bpm: 180, color: "#EF4444", notes: this.generateRockPattern() }
        ];
        this.currentTrack = 0;
        this.perfectHit = 0;
        this.goodHit = 0;
        this.missHit = 0;
        this.audioContext = null;
        this.sounds = {};
        this.backgroundMusic = null;
    }

    // 生成不同音乐风格的节拍模式
    generateClassicalPattern() {
        return [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0]; // 古典节奏
    }

    generateJazzPattern() {
        return [1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0]; // 爵士摇摆
    }

    generateElectronicPattern() {
        return [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1]; // 电子节拍
    }

    generateRockPattern() {
        return [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1]; // 摇滚激情
    }

    // 启动游戏
    startMusicBeatMasterGame() {
        this.createGameContainer();
        this.setupCanvas();
        this.initializeBackground();
        this.initializeAudio();
        this.showMainMenu();
        this.bindEvents();
    }

    // 创建游戏容器
    createGameContainer() {
        this.gameContainer = document.createElement('div');
        this.gameContainer.className = 'music-beat-master-game';
        this.gameContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
            color: white;
            overflow: hidden;
        `;
        document.body.appendChild(this.gameContainer);
    }

    // 设置画布
    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.cssText = `
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
            background: rgba(0, 0, 0, 0.3);
        `;
        this.ctx = this.canvas.getContext('2d');
        this.gameContainer.appendChild(this.canvas);
    }

    // 初始化背景星空
    initializeBackground() {
        this.backgroundStars = [];
        for (let i = 0; i < 100; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.8 + 0.2,
                speed: Math.random() * 0.5 + 0.1
            });
        }
    }

    // 初始化音效系统
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (error) {
            console.log('音频上下文初始化失败，将使用静音模式');
        }
    }

    // 创建音效
    createSounds() {
        if (!this.audioContext) return;

        // 完美命中音效 - 高音调
        this.sounds.perfect = this.createTone(800, 0.1, 'sine');
        
        // 良好命中音效 - 中音调
        this.sounds.good = this.createTone(600, 0.1, 'sine');
        
        // 一般命中音效 - 低音调
        this.sounds.ok = this.createTone(400, 0.1, 'sine');
        
        // 未命中音效 - 不和谐音
        this.sounds.miss = this.createTone(200, 0.2, 'sawtooth');
        
        // 升级音效 - 上升音阶
        this.sounds.levelUp = this.createLevelUpSound();
        
        // 背景节拍音效
        this.sounds.beat = this.createTone(300, 0.05, 'square');
    }

    // 创建音调
    createTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return null;
        
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    // 创建升级音效
    createLevelUpSound() {
        if (!this.audioContext) return null;
        
        return () => {
            const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.2);
                }, index * 100);
            });
        };
    }

    // 播放音效
    playSound(soundName) {
        if (this.sounds[soundName] && this.audioContext) {
            try {
                // 如果音频上下文被暂停，恢复它
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                this.sounds[soundName]();
            } catch (error) {
                console.log('音效播放失败:', error);
            }
        }
    }

    // 开始背景节拍
    startBackgroundBeat() {
        if (!this.sounds.beat) return;
        
        this.beatIntervalId = setInterval(() => {
            if (this.gameState === 'playing') {
                this.playSound('beat');
            }
        }, this.beatInterval);
    }

    // 停止背景节拍
    stopBackgroundBeat() {
        if (this.beatIntervalId) {
            clearInterval(this.beatIntervalId);
            this.beatIntervalId = null;
        }
    }

    // 显示主菜单
    showMainMenu() {
        this.gameState = 'menu';
        this.render();
        
        const menuHTML = `
            <div class="game-menu" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 10001;
            ">
                <h1 style="
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f4d03f);
                    background-size: 400% 400%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradientShift 3s ease infinite;
                ">🎵 音乐节拍大师 🎵</h1>
                <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.8;">
                    跟随节拍，成为音乐大师！
                </p>
                <div class="track-selection" style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem;">选择音乐风格：</h3>
                    ${this.musicTracks.map((track, index) => `
                        <button class="track-btn" data-track="${index}" style="
                            background: ${track.color};
                            border: none;
                            padding: 12px 24px;
                            margin: 5px;
                            border-radius: 25px;
                            color: white;
                            font-size: 1rem;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                            ${track.name} (${track.bpm} BPM)
                        </button>
                    `).join('')}
                </div>
                <div class="game-controls">
                    <button id="start-game" style="
                        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                        border: none;
                        padding: 15px 30px;
                        border-radius: 30px;
                        color: white;
                        font-size: 1.2rem;
                        font-weight: bold;
                        cursor: pointer;
                        margin: 10px;
                        transition: all 0.3s ease;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🎮 开始游戏
                    </button>
                    <button id="close-game" style="
                        background: linear-gradient(45deg, #6b7280, #9ca3af);
                        border: none;
                        padding: 15px 30px;
                        border-radius: 30px;
                        color: white;
                        font-size: 1.2rem;
                        font-weight: bold;
                        cursor: pointer;
                        margin: 10px;
                        transition: all 0.3s ease;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        ❌ 关闭游戏
                    </button>
                </div>
                <div class="instructions" style="
                    margin-top: 2rem;
                    font-size: 0.9rem;
                    opacity: 0.7;
                    max-width: 500px;
                ">
                    <p>🎯 游戏说明：</p>
                    <p>• 当音符到达底部时，按空格键或点击屏幕</p>
                    <p>• 完美命中获得更多分数和连击</p>
                    <p>• 连续命中可以增加连击倍数</p>
                    <p>• 错过太多音符会失去生命值</p>
                </div>
            </div>
            <style>
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            </style>
        `;
        
        this.gameContainer.insertAdjacentHTML('beforeend', menuHTML);
    }

    // 绑定事件
    bindEvents() {
        // 轨道选择
        this.gameContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('track-btn')) {
                this.currentTrack = parseInt(e.target.dataset.track);
                this.bpm = this.musicTracks[this.currentTrack].bpm;
                this.beatInterval = 60000 / this.bpm;
                this.beatNotes = this.musicTracks[this.currentTrack].notes;
                
                // 高亮选中的轨道
                document.querySelectorAll('.track-btn').forEach(btn => {
                    btn.style.opacity = '0.6';
                    btn.style.transform = 'scale(1)';
                });
                e.target.style.opacity = '1';
                e.target.style.transform = 'scale(1.1)';
            }
            
            if (e.target.id === 'start-game') {
                this.startGame();
            }
            
            if (e.target.id === 'close-game') {
                this.closeGame();
            }
        });

        // 游戏控制
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.hitBeat();
                }
                if (e.code === 'Escape') {
                    this.pauseGame();
                }
            } else if (this.gameState === 'paused') {
                if (e.code === 'Escape') {
                    this.resumeGame();
                }
            }
        });

        // 点击屏幕
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.hitBeat();
            }
        });
    }

    // 开始游戏
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lives = 3;
        this.level = 1;
        this.beatIndex = 0;
        this.gameTime = 0;
        this.lastBeatTime = 0;
        this.particles = [];
        this.perfectHit = 0;
        this.goodHit = 0;
        this.missHit = 0;
        this.newNoteSpeed = 2;
        
        // 清除菜单
        const menu = this.gameContainer.querySelector('.game-menu');
        if (menu) menu.remove();
        
        // 开始背景节拍
        this.startBackgroundBeat();
        
        this.gameLoop();
    }

    // 暂停游戏
    pauseGame() {
        this.gameState = 'paused';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.stopBackgroundBeat();
        this.showPauseMenu();
    }

    // 恢复游戏
    resumeGame() {
        this.gameState = 'playing';
        const pauseMenu = this.gameContainer.querySelector('.pause-menu');
        if (pauseMenu) pauseMenu.remove();
        this.startBackgroundBeat();
        this.gameLoop();
    }

    // 显示暂停菜单
    showPauseMenu() {
        const pauseHTML = `
            <div class="pause-menu" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 10001;
                background: rgba(0, 0, 0, 0.8);
                padding: 2rem;
                border-radius: 20px;
                border: 2px solid rgba(255, 255, 255, 0.2);
            ">
                <h2 style="margin-bottom: 1rem;">⏸️ 游戏暂停</h2>
                <p style="margin-bottom: 1.5rem;">按 ESC 键继续游戏</p>
                <button id="resume-game" style="
                    background: linear-gradient(45deg, #10b981, #059669);
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    color: white;
                    font-size: 1rem;
                    cursor: pointer;
                    margin: 5px;
                    transition: all 0.3s ease;
                ">继续游戏</button>
                <button id="restart-game" style="
                    background: linear-gradient(45deg, #f59e0b, #d97706);
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    color: white;
                    font-size: 1rem;
                    cursor: pointer;
                    margin: 5px;
                    transition: all 0.3s ease;
                ">重新开始</button>
                <button id="quit-game" style="
                    background: linear-gradient(45deg, #ef4444, #dc2626);
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    color: white;
                    font-size: 1rem;
                    cursor: pointer;
                    margin: 5px;
                    transition: all 0.3s ease;
                ">退出游戏</button>
            </div>
        `;
        
        this.gameContainer.insertAdjacentHTML('beforeend', pauseHTML);
        
        // 绑定暂停菜单事件
        document.getElementById('resume-game').onclick = () => this.resumeGame();
        document.getElementById('restart-game').onclick = () => this.startGame();
        document.getElementById('quit-game').onclick = () => this.closeGame();
    }

    // 游戏主循环
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    // 更新游戏状态
    update() {
        this.gameTime += 16; // 假设60FPS
        
        // 生成节拍音符
        if (this.gameTime - this.lastBeatTime >= this.beatInterval) {
            this.lastBeatTime = this.gameTime;
            if (this.beatNotes[this.beatIndex % this.beatNotes.length] === 1) {
                this.beatNotes.push({
                    x: this.canvas.width / 2,
                    y: 50,
                    targetY: this.canvas.height - 100,
                    speed: this.newNoteSpeed,
                    hit: false,
                    perfect: false,
                    time: this.gameTime
                });
            }
            this.beatIndex++;
        }
        
        // 更新音符位置
        this.beatNotes.forEach((note, index) => {
            if (!note.hit) {
                note.y += note.speed;
                if (note.y >= note.targetY) {
                    this.missBeat(index);
                }
            }
        });
        
        // 更新粒子效果
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // 更新背景星空
        this.backgroundStars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });
        
        // 检查游戏结束
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    // 渲染游戏
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景星空
        this.drawBackground();
        
        // 绘制游戏界面
        this.drawGameUI();
        
        // 绘制音符
        this.drawBeatNotes();
        
        // 绘制粒子效果
        this.drawParticles();
        
        // 绘制节拍线
        this.drawBeatLine();
    }

    // 绘制背景
    drawBackground() {
        this.backgroundStars.forEach(star => {
            this.ctx.save();
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    // 绘制游戏UI
    drawGameUI() {
        const track = this.musicTracks[this.currentTrack];
        
        // 绘制分数
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Inter';
        this.ctx.fillText(`分数: ${this.score}`, 20, 40);
        
        // 绘制连击
        if (this.combo > 0) {
            this.ctx.fillStyle = track.color;
            this.ctx.font = 'bold 20px Inter';
            this.ctx.fillText(`连击: ${this.combo}x`, 20, 70);
        }
        
        // 绘制生命值
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 20px Inter';
        this.ctx.fillText(`生命: ${'❤️'.repeat(this.lives)}`, 20, 100);
        
        // 绘制当前轨道信息
        this.ctx.fillStyle = track.color;
        this.ctx.font = 'bold 18px Inter';
        this.ctx.fillText(`${track.name} (${track.bpm} BPM)`, this.canvas.width - 200, 40);
        
        // 绘制等级
        this.ctx.fillStyle = '#f4d03f';
        this.ctx.font = 'bold 18px Inter';
        this.ctx.fillText(`等级: ${this.level}`, this.canvas.width - 200, 70);
    }

    // 绘制音符
    drawBeatNotes() {
        this.beatNotes.forEach(note => {
            if (!note.hit) {
                const track = this.musicTracks[this.currentTrack];
                const distance = Math.abs(note.y - note.targetY);
                const alpha = Math.max(0.3, 1 - distance / 200);
                
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                
                // 绘制音符主体
                this.ctx.fillStyle = track.color;
                this.ctx.beginPath();
                this.ctx.arc(note.x, note.y, 20, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 绘制音符边框
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                
                // 绘制音符符号
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 16px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('♪', note.x, note.y + 6);
                
                this.ctx.restore();
            }
        });
    }

    // 绘制粒子效果
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    // 绘制节拍线
    drawBeatLine() {
        const track = this.musicTracks[this.currentTrack];
        const y = this.canvas.height - 100;
        
        // 绘制节拍线
        this.ctx.strokeStyle = track.color;
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 绘制命中区域
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y - 30);
        this.ctx.lineTo(this.canvas.width, y - 30);
        this.ctx.moveTo(0, y + 30);
        this.ctx.lineTo(this.canvas.width, y + 30);
        this.ctx.stroke();
    }

    // 命中节拍
    hitBeat() {
        let hit = false;
        let bestIndex = -1;
        let bestDistance = Infinity;
        
        // 找到最近的音符
        this.beatNotes.forEach((note, index) => {
            if (!note.hit) {
                const distance = Math.abs(note.y - (this.canvas.height - 100));
                if (distance < 60 && distance < bestDistance) {
                    bestDistance = distance;
                    bestIndex = index;
                    hit = true;
                }
            }
        });
        
        if (hit) {
            const note = this.beatNotes[bestIndex];
            note.hit = true;
            
            // 计算命中精度
            if (bestDistance <= 15) {
                // 完美命中
                note.perfect = true;
                this.score += 100 * (this.combo + 1);
                this.combo++;
                this.perfectHit++;
                this.playSound('perfect');
                this.createHitParticles(note.x, note.y, '#10b981', 'PERFECT!');
            } else if (bestDistance <= 30) {
                // 良好命中
                this.score += 50 * (this.combo + 1);
                this.combo++;
                this.goodHit++;
                this.playSound('good');
                this.createHitParticles(note.x, note.y, '#f59e0b', 'GOOD!');
            } else {
                // 一般命中
                this.score += 25;
                this.combo = 0;
                this.playSound('ok');
                this.createHitParticles(note.x, note.y, '#6b7280', 'OK');
            }
            
            // 更新最大连击
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
            
            // 添加连击特效
            this.addComboEffect();
            
            // 升级检查
            if (this.score > this.level * 1000) {
                this.level++;
                this.playSound('levelUp');
                this.createLevelUpEffect();
                this.increaseDifficulty();
            }
        } else {
            // 未命中
            this.combo = 0;
            this.createMissEffect();
        }
    }

    // 错过节拍
    missBeat(index) {
        this.beatNotes.splice(index, 1);
        this.lives--;
        this.combo = 0;
        this.missHit++;
        this.playSound('miss');
        this.createMissEffect();
    }

    // 创建命中粒子效果
    createHitParticles(x, y, color, text) {
        // 创建爆炸粒子
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 4 + 2,
                color: color,
                life: 30,
                maxLife: 30,
                alpha: 1
            });
        }
        
        // 显示命中文字
        this.showHitText(x, y, text, color);
    }

    // 显示命中文字
    showHitText(x, y, text, color) {
        const textElement = document.createElement('div');
        textElement.textContent = text;
        textElement.style.cssText = `
            position: absolute;
            left: ${x + this.canvas.offsetLeft}px;
            top: ${y + this.canvas.offsetTop}px;
            color: ${color};
            font-size: 24px;
            font-weight: bold;
            pointer-events: none;
            z-index: 10002;
            animation: hitTextAnimation 1s ease-out forwards;
        `;
        
        // 添加动画样式
        if (!document.getElementById('hit-text-animation')) {
            const style = document.createElement('style');
            style.id = 'hit-text-animation';
            style.textContent = `
                @keyframes hitTextAnimation {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-50px) scale(1.5);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.gameContainer.appendChild(textElement);
        
        setTimeout(() => {
            if (textElement.parentNode) {
                textElement.parentNode.removeChild(textElement);
            }
        }, 1000);
    }

    // 创建升级效果
    createLevelUpEffect() {
        // 创建升级粒子效果
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                size: Math.random() * 6 + 3,
                color: '#f4d03f',
                life: 60,
                maxLife: 60,
                alpha: 1
            });
        }
        
        this.showHitText(this.canvas.width / 2, this.canvas.height / 2, 'LEVEL UP!', '#f4d03f');
    }

    // 创建未命中效果
    createMissEffect() {
        // 创建红色警告粒子
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height - 100,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 3 + 2,
                color: '#ef4444',
                life: 40,
                maxLife: 40,
                alpha: 1
            });
        }
        
        this.showHitText(this.canvas.width / 2, this.canvas.height - 100, 'MISS!', '#ef4444');
    }

    // 游戏结束
    gameOver() {
        this.gameState = 'gameOver';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.stopBackgroundBeat();
        this.showGameOverScreen();
    }

    // 显示游戏结束界面
    showGameOverScreen() {
        const gameOverHTML = `
            <div class="game-over-screen" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            ">
                <div class="game-over-content" style="
                    text-align: center;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 3rem;
                    border-radius: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                ">
                    <h1 style="
                        font-size: 3rem;
                        margin-bottom: 1rem;
                        background: linear-gradient(45deg, #ef4444, #f59e0b);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    ">🎵 游戏结束 🎵</h1>
                    
                    <div class="final-stats" style="margin: 2rem 0;">
                        <h2 style="margin-bottom: 1rem;">最终统计</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: left;">
                            <div>最终分数: <span style="color: #4ecdc4; font-weight: bold;">${this.score}</span></div>
                            <div>最大连击: <span style="color: #f4d03f; font-weight: bold;">${this.maxCombo}</span></div>
                            <div>达到等级: <span style="color: #10b981; font-weight: bold;">${this.level}</span></div>
                            <div>完美命中: <span style="color: #10b981; font-weight: bold;">${this.perfectHit}</span></div>
                            <div>良好命中: <span style="color: #f59e0b; font-weight: bold;">${this.goodHit}</span></div>
                            <div>未命中: <span style="color: #ef4444; font-weight: bold;">${this.missHit}</span></div>
                        </div>
                    </div>
                    
                    <div class="game-over-controls">
                        <button id="play-again" style="
                            background: linear-gradient(45deg, #10b981, #059669);
                            border: none;
                            padding: 15px 30px;
                            border-radius: 30px;
                            color: white;
                            font-size: 1.2rem;
                            font-weight: bold;
                            cursor: pointer;
                            margin: 10px;
                            transition: all 0.3s ease;
                        ">🎮 再玩一次</button>
                        <button id="back-to-menu" style="
                            background: linear-gradient(45deg, #6b7280, #9ca3af);
                            border: none;
                            padding: 15px 30px;
                            border-radius: 30px;
                            color: white;
                            font-size: 1.2rem;
                            font-weight: bold;
                            cursor: pointer;
                            margin: 10px;
                            transition: all 0.3s ease;
                        ">🏠 返回菜单</button>
                        <button id="close-game-final" style="
                            background: linear-gradient(45deg, #ef4444, #dc2626);
                            border: none;
                            padding: 15px 30px;
                            border-radius: 30px;
                            color: white;
                            font-size: 1.2rem;
                            font-weight: bold;
                            cursor: pointer;
                            margin: 10px;
                            transition: all 0.3s ease;
                        ">❌ 关闭游戏</button>
                    </div>
                </div>
            </div>
        `;
        
        this.gameContainer.insertAdjacentHTML('beforeend', gameOverHTML);
        
        // 绑定游戏结束事件
        document.getElementById('play-again').onclick = () => {
            document.querySelector('.game-over-screen').remove();
            this.startGame();
        };
        document.getElementById('back-to-menu').onclick = () => {
            document.querySelector('.game-over-screen').remove();
            this.showMainMenu();
        };
        document.getElementById('close-game-final').onclick = () => this.closeGame();
    }

    // 关闭游戏
    closeGame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.stopBackgroundBeat();
        
        if (this.gameContainer && this.gameContainer.parentNode) {
            this.gameContainer.parentNode.removeChild(this.gameContainer);
        }
        
        // 清理样式
        const hitTextStyle = document.getElementById('hit-text-animation');
        if (hitTextStyle) {
            hitTextStyle.remove();
        }
        
        // 清理音频上下文
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    // 增加难度
    increaseDifficulty() {
        // 增加音符速度
        this.beatNotes.forEach(note => {
            note.speed += 0.1;
        });
        
        // 减少节拍间隔（增加BPM）
        this.beatInterval = Math.max(200, this.beatInterval - 10);
        
        // 增加新音符的速度
        this.newNoteSpeed = (this.newNoteSpeed || 2) + 0.1;
    }

    // 添加屏幕震动效果
    addScreenShake(intensity = 5) {
        if (this.gameContainer) {
            this.gameContainer.style.animation = `screenShake 0.3s ease-in-out`;
            
            // 添加震动动画样式
            if (!document.getElementById('screen-shake-animation')) {
                const style = document.createElement('style');
                style.id = 'screen-shake-animation';
                style.textContent = `
                    @keyframes screenShake {
                        0%, 100% { transform: translateX(0); }
                        10% { transform: translateX(-${intensity}px); }
                        20% { transform: translateX(${intensity}px); }
                        30% { transform: translateX(-${intensity}px); }
                        40% { transform: translateX(${intensity}px); }
                        50% { transform: translateX(-${intensity}px); }
                        60% { transform: translateX(${intensity}px); }
                        70% { transform: translateX(-${intensity}px); }
                        80% { transform: translateX(${intensity}px); }
                        90% { transform: translateX(-${intensity}px); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            setTimeout(() => {
                this.gameContainer.style.animation = '';
            }, 300);
        }
    }

    // 添加连击特效
    addComboEffect() {
        if (this.combo > 0 && this.combo % 10 === 0) {
            // 每10连击添加特殊效果
            this.addScreenShake(3);
            
            // 创建连击粒子爆炸
            for (let i = 0; i < 30; i++) {
                this.particles.push({
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2,
                    vx: (Math.random() - 0.5) * 20,
                    vy: (Math.random() - 0.5) * 20,
                    size: Math.random() * 6 + 3,
                    color: this.musicTracks[this.currentTrack].color,
                    life: 60,
                    maxLife: 60,
                    alpha: 1
                });
            }
            
            this.showHitText(this.canvas.width / 2, this.canvas.height / 2, `${this.combo} COMBO!`, this.musicTracks[this.currentTrack].color);
        }
    }
}
