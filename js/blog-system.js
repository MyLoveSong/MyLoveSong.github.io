/**
 * 轻量级Markdown博客系统
 * 实现任务 C.1：轻量级 Markdown 博客
 * 优化版本 - 最佳用户体验
 */

class OptimizedBlogSystem {
    constructor() {
        this.posts = [];
        this.currentPost = null;
        this.searchTerm = '';
        this.markdownParser = null;
        this.theme = this.loadTheme();
        this.searchHistory = this.loadSearchHistory();
        this.readingProgress = new Map();
        this.imageCache = new Map();
        this.performanceMetrics = {
            loadTime: 0,
            renderTime: 0,
            searchTime: 0
        };
        
        this.init();
    }

    /**
     * 初始化博客系统
     */
    async init() {
        const startTime = performance.now();
        console.log('🚀 初始化优化博客系统...');
        
        try {
            // 并行执行初始化任务（禁用Service Worker，因为本地文件不支持）
            await Promise.all([
                this.loadMarkdownParser(),
                this.loadPosts(),
                // this.setupServiceWorker(), // 本地文件环境不支持Service Worker
                this.preloadCriticalResources()
            ]);
            
            // 渲染界面
            this.renderBlogInterface();
            
            // 绑定事件
            this.bindEvents();
            
            // 应用主题
            this.applyTheme(this.theme);
            
            // 恢复阅读进度
            this.restoreReadingProgress();
            
            this.performanceMetrics.loadTime = performance.now() - startTime;
            console.log(`✅ 博客系统初始化完成 (${this.performanceMetrics.loadTime.toFixed(2)}ms)`);
            
            // 性能监控
            this.setupPerformanceMonitoring();
            
        } catch (error) {
            console.error('❌ 博客系统初始化失败:', error);
            this.showErrorMessage('系统初始化失败，请刷新页面重试');
        }
    }

    /**
     * 动态加载Markdown解析器
     */
    async loadMarkdownParser() {
        return new Promise((resolve) => {
            // 尝试加载marked.js
            const markedScript = document.createElement('script');
            markedScript.src = 'https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js';
            markedScript.onload = () => {
                this.markdownParser = window.marked;
                this.markdownParser.setOptions({
                    breaks: true,
                    gfm: true,
                    sanitize: false,
                    highlight: this.highlightCode.bind(this)
                });
                console.log('✅ Markdown解析器加载成功');
                resolve();
            };
            markedScript.onerror = () => {
                console.warn('⚠️ 无法加载外部Markdown解析器，使用内置解析器');
                this.markdownParser = this.createAdvancedMarkdownParser();
                resolve();
            };
            document.head.appendChild(markedScript);
        });
    }

    /**
     * 创建高级Markdown解析器（备用方案）
     */
    createAdvancedMarkdownParser() {
        return {
            parse: (markdown) => {
                return markdown
                    // 标题
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    // 强调
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    // 代码
                    .replace(/`([^`]+)`/gim, '<code>$1</code>')
                    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
                    // 链接
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
                    // 图片
                    .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" loading="lazy">')
                    // 列表
                    .replace(/^- (.*$)/gim, '<li>$1</li>')
                    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
                    // 引用
                    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
                    // 分割线
                    .replace(/^---$/gim, '<hr>')
                    // 换行
                    .replace(/\n/gim, '<br>');
            }
        };
    }

    /**
     * 代码高亮
     */
    highlightCode(code, language) {
        if (language && window.hljs) {
            return window.hljs.highlight(code, { language }).value;
        }
        return code;
    }

    /**
     * 加载所有博客文章
     */
    async loadPosts() {
        try {
            console.log('📖 正在加载博客文章...');
            
            // 获取posts文件夹中的文章列表
            const postFiles = [
                'welcome.md',
                'web-development.md',
                'travel-map.md'
            ];

            // 并行加载所有文章
            const postPromises = postFiles.map(filename => this.loadPost(filename));
            this.posts = await Promise.all(postPromises);
            
            // 按日期排序
            this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            console.log(`✅ 成功加载 ${this.posts.length} 篇文章`);
        } catch (error) {
            console.error('❌ 加载博客文章失败:', error);
            this.posts = [];
        }
    }

    /**
     * 加载单篇博客文章
     */
    async loadPost(filename) {
        try {
            // 检查是否在本地文件环境中
            if (window.location.protocol === 'file:') {
                console.log(`📝 本地文件环境，使用示例文章内容: ${filename}`);
                return this.getSamplePost(filename);
            }
            
            const response = await fetch(`posts/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const markdown = await response.text();
            const html = this.markdownParser ? this.markdownParser.parse(markdown) : markdown;
            
            // 提取文章元数据
            const metadata = this.extractMetadata(markdown);
            
            // 计算阅读时间
            const readingTime = this.calculateReadingTime(markdown);
            
            return {
                filename,
                title: metadata.title || filename.replace('.md', ''),
                content: html,
                markdown,
                metadata,
                date: metadata.date || new Date().toISOString(),
                tags: metadata.tags || [],
                readingTime,
                wordCount: this.countWords(markdown),
                lastModified: response.headers.get('last-modified')
            };
        } catch (error) {
            console.error(`❌ 加载文章 ${filename} 失败:`, error);
            
            // 如果是CORS错误，提供示例内容
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                console.log(`🔄 CORS错误，使用示例文章内容: ${filename}`);
                return this.getSamplePost(filename);
            }
            
            return {
                filename,
                title: filename.replace('.md', ''),
                content: `<p>无法加载文章内容: ${error.message}</p>`,
                markdown: '',
                metadata: {},
                date: new Date().toISOString(),
                tags: [],
                readingTime: 0,
                wordCount: 0
            };
        }
    }

    /**
     * 获取示例博客文章内容（用于本地文件环境或CORS错误时）
     */
    getSamplePost(filename) {
        const samplePosts = {
            'welcome.md': {
                title: '欢迎来到音乐盛宴',
                content: `
                    <h1>🎵 欢迎来到音乐盛宴</h1>
                    <p>欢迎来到我的个人音乐网站！这里是我展示音乐创作、分享音乐理念的地方。</p>
                    <h2>关于我</h2>
                    <p>我是一名热爱音乐的程序员，喜欢探索古典音乐与现代技术的结合。</p>
                    <h2>音乐理念</h2>
                    <p>音乐是世界的通用语言，它跨越国界、种族和文化。</p>
                    <h3>技能特长</h3>
                    <ul>
                        <li>🎹 钢琴演奏</li>
                        <li>🎼 音乐创作</li>
                        <li>🎤 声乐表演</li>
                        <li>💻 音乐编程</li>
                    </ul>
                `,
                tags: ['音乐', '欢迎', '介绍'],
                date: '2024-01-01'
            },
            'web-development.md': {
                title: 'Web开发与音乐的结合',
                content: `
                    <h1>🌐 Web开发与音乐的结合</h1>
                    <p>探索如何将Web技术与音乐创作相结合，创造独特的数字音乐体验。</p>
                    <h2>技术栈</h2>
                    <ul>
                        <li>HTML5 Audio API</li>
                        <li>Web Audio API</li>
                        <li>Canvas动画</li>
                        <li>WebGL音效</li>
                    </ul>
                    <h2>项目案例</h2>
                    <p>这个网站就是技术与音乐结合的完美例子！</p>
                `,
                tags: ['Web开发', '音乐技术', '编程'],
                date: '2024-01-02'
            },
            'travel-map.md': {
                title: '音乐之旅地图',
                content: `
                    <h1>🗺️ 音乐之旅地图</h1>
                    <p>记录我在音乐道路上的每一个重要时刻和地点。</p>
                    <h2>重要里程碑</h2>
                    <ul>
                        <li>🎵 第一次钢琴演奏</li>
                        <li>🎼 第一首原创作品</li>
                        <li>🎤 第一次公开演出</li>
                        <li>💻 第一个音乐网站</li>
                    </ul>
                    <h2>未来计划</h2>
                    <p>继续探索音乐与技术的无限可能！</p>
                `,
                tags: ['音乐之旅', '里程碑', '计划'],
                date: '2024-01-03'
            }
        };
        
        const post = samplePosts[filename] || {
            title: filename.replace('.md', ''),
            content: '<p>文章内容加载中...</p>',
            tags: [],
            date: new Date().toISOString()
        };
        
        return {
            filename,
            title: post.title,
            content: post.content,
            markdown: '',
            metadata: { title: post.title, date: post.date, tags: post.tags },
            date: post.date,
            tags: post.tags,
            readingTime: this.calculateReadingTime(post.content),
            wordCount: this.countWords(post.content)
        };
    }

    /**
     * 提取Markdown文章的元数据
     */
    extractMetadata(markdown) {
        const metadata = {};
        
        // 提取标题
        const titleMatch = markdown.match(/^# (.*$)/m);
        if (titleMatch) {
            metadata.title = titleMatch[1];
        }
        
        // 提取日期
        const dateMatch = markdown.match(/发布时间[：:]\s*(.*)/);
        if (dateMatch) {
            metadata.date = dateMatch[1];
        }
        
        // 提取标签
        const tagMatch = markdown.match(/标签[：:]\s*(.*)/);
        if (tagMatch) {
            metadata.tags = tagMatch[1].split(',').map(tag => tag.trim());
        }
        
        // 提取作者
        const authorMatch = markdown.match(/作者[：:]\s*(.*)/);
        if (authorMatch) {
            metadata.author = authorMatch[1];
        }
        
        return metadata;
    }

    /**
     * 计算阅读时间
     */
    calculateReadingTime(markdown) {
        const wordsPerMinute = 200; // 平均阅读速度
        const wordCount = this.countWords(markdown);
        return Math.ceil(wordCount / wordsPerMinute);
    }

    /**
     * 统计字数
     */
    countWords(text) {
        return text.replace(/\s+/g, ' ').trim().split(' ').length;
    }

    /**
     * 渲染博客界面
     */
    renderBlogInterface() {
        // 只在博客页面或指定容器中渲染博客界面
        let blogContainer = document.getElementById('blog-container');
        
        // 如果没有找到博客容器，尝试查找备用容器
        if (!blogContainer) {
            // 尝试查找其他可能的容器
            blogContainer = document.querySelector('.blog-section, .blog-content, #blog, .blog') || 
                          document.querySelector('section[data-section="blog"]');
            
            // 如果还是没有找到，检查当前页面是否是博客页面
            if (!blogContainer) {
                const isBlogPage = this.isBlogPage();
                if (!isBlogPage) {
                    console.log('📝 当前页面不是博客页面，跳过博客界面渲染');
                    return; // 不是博客页面，不渲染博客界面
                }
                
                console.log('📝 博客页面，创建博客容器元素');
                // 在页面末尾创建一个博客容器
                blogContainer = document.createElement('div');
                blogContainer.id = 'blog-container';
                blogContainer.className = 'blog-container';
                blogContainer.style.cssText = `
                    padding: 2rem;
                    margin: 2rem 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 15px;
                    color: white;
                `;
                document.body.appendChild(blogContainer);
            }
        }

        blogContainer.innerHTML = `
            <div class="blog-header">
                <div class="header-content">
                    <h1>📚 我的博客</h1>
                    <p class="header-subtitle">分享技术、记录生活、探索世界</p>
                </div>
                
                <div class="header-controls">
                    <div class="blog-search">
                        <input type="text" id="blog-search-input" placeholder="搜索文章..." autocomplete="off" />
                        <button id="blog-search-btn" aria-label="搜索">🔍</button>
                        <div id="search-suggestions" class="search-suggestions"></div>
                    </div>
                    
                    <div class="theme-controls">
                        <button id="theme-toggle" class="theme-toggle" aria-label="切换主题">🌙</button>
                        <button id="font-size-toggle" class="font-size-toggle" aria-label="调整字体大小">A</button>
                    </div>
                </div>
            </div>
            
            <div class="blog-content">
                <div class="blog-sidebar">
                    <div class="sidebar-section">
                        <h3>📝 文章列表</h3>
                        <div class="sort-controls">
                            <select id="sort-select">
                                <option value="date">按日期排序</option>
                                <option value="title">按标题排序</option>
                                <option value="reading-time">按阅读时间排序</option>
                            </select>
                        </div>
                        <div id="posts-list" class="posts-list"></div>
                    </div>
                    
                    <div class="sidebar-section">
                        <h3>🏷️ 标签云</h3>
                        <div id="tags-cloud" class="tags-cloud"></div>
                    </div>
                    
                    <div class="sidebar-section">
                        <h3>📊 统计信息</h3>
                        <div id="blog-stats" class="blog-stats"></div>
                    </div>
                </div>
                
                <div class="blog-main">
                    <div id="post-content" class="post-content-container">
                        <div class="welcome-message">
                            <div class="welcome-icon">👋</div>
                            <h2>欢迎来到我的博客</h2>
                            <p>这里有 ${this.posts.length} 篇文章等待您的阅读</p>
                            <div class="welcome-actions">
                                <button onclick="blogSystem.showRandomPost()" class="action-btn">🎲 随机阅读</button>
                                <button onclick="blogSystem.showLatestPost()" class="action-btn">📰 最新文章</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="reading-progress" id="reading-progress"></div>
        `;

        // 渲染各个组件
        this.renderPostsList();
        this.renderTagsCloud();
        this.renderBlogStats();
    }

    /**
     * 渲染文章列表
     */
    renderPostsList() {
        const postsList = document.getElementById('posts-list');
        if (!postsList) return;

        const filteredPosts = this.getFilteredPosts();
        
        if (filteredPosts.length === 0) {
            postsList.innerHTML = '<div class="no-posts">暂无文章</div>';
            return;
        }

        const postsHtml = filteredPosts.map(post => {
            const isActive = this.currentPost?.filename === post.filename;
            const progress = this.readingProgress.get(post.filename) || 0;
            
            return `
                <div class="post-item ${isActive ? 'active' : ''}" 
                     data-filename="${post.filename}"
                     data-progress="${progress}">
                    <div class="post-item-header">
                        <h4>${post.title}</h4>
                        <div class="post-item-meta">
                            <span class="post-date">${this.formatDate(post.date)}</span>
                            <span class="reading-time">${post.readingTime}分钟</span>
                        </div>
                    </div>
                    
                    <div class="post-item-content">
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <div class="post-stats">
                            <span class="word-count">${post.wordCount}字</span>
                            ${progress > 0 ? `<span class="progress">已读${Math.round(progress)}%</span>` : ''}
                        </div>
                    </div>
                    
                    ${progress > 0 ? `<div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>` : ''}
                </div>
            `;
        }).join('');

        postsList.innerHTML = postsHtml;
    }

    /**
     * 渲染标签云
     */
    renderTagsCloud() {
        const tagsCloud = document.getElementById('tags-cloud');
        if (!tagsCloud) return;

        // 收集所有标签并统计频率
        const tagCounts = new Map();
        this.posts.forEach(post => {
            post.tags.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });

        const tags = Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20); // 显示前20个标签

        const maxCount = Math.max(...tags.map(([, count]) => count));
        
        const tagsHtml = tags.map(([tag, count]) => {
            const size = Math.max(12, (count / maxCount) * 24 + 12);
            return `<span class="tag-cloud-item" 
                          data-tag="${tag}" 
                          style="font-size: ${size}px; opacity: ${0.6 + (count / maxCount) * 0.4}">
                        ${tag}
                    </span>`;
        }).join('');

        tagsCloud.innerHTML = tagsHtml || '<div class="no-tags">暂无标签</div>';
    }

    /**
     * 渲染博客统计信息
     */
    renderBlogStats() {
        const blogStats = document.getElementById('blog-stats');
        if (!blogStats) return;

        const totalWords = this.posts.reduce((sum, post) => sum + post.wordCount, 0);
        const totalReadingTime = this.posts.reduce((sum, post) => sum + post.readingTime, 0);
        const allTags = new Set();
        this.posts.forEach(post => post.tags.forEach(tag => allTags.add(tag)));

        blogStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">总文章数</span>
                <span class="stat-value">${this.posts.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">总字数</span>
                <span class="stat-value">${totalWords.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">总阅读时间</span>
                <span class="stat-value">${totalReadingTime}分钟</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">标签数量</span>
                <span class="stat-value">${allTags.size}</span>
            </div>
        `;
    }

    /**
     * 显示文章内容
     */
    showPost(filename) {
        const post = this.posts.find(p => p.filename === filename);
        if (!post) {
            console.warn(`⚠️ 未找到文章: ${filename}`);
            return;
        }

        this.currentPost = post;
        const postContent = document.getElementById('post-content');
        
        if (postContent) {
            postContent.innerHTML = `
                <article class="blog-post" data-filename="${filename}">
                    <header class="post-header">
                        <div class="post-title-section">
                            <h1>${post.title}</h1>
                            <div class="post-meta">
                                <span class="post-date">📅 ${this.formatDate(post.date)}</span>
                                <span class="reading-time">⏱️ ${post.readingTime}分钟阅读</span>
                                <span class="word-count">📝 ${post.wordCount}字</span>
                                ${post.metadata.author ? `<span class="author">👤 ${post.metadata.author}</span>` : ''}
                            </div>
                        </div>
                        
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </header>
                    
                    <div class="post-content">
                        ${post.content}
                    </div>
                    
                    <footer class="post-footer">
                        <div class="post-actions">
                            <button class="btn-back" onclick="blogSystem.showPostList()">← 返回列表</button>
                            <button class="btn-edit" onclick="blogSystem.editPost('${filename}')">✏️ 编辑</button>
                            <button class="btn-share" onclick="blogSystem.sharePost('${filename}')">📤 分享</button>
                        </div>
                        
                        <div class="post-navigation">
                            ${this.getPostNavigation(filename)}
                        </div>
                    </footer>
                </article>
            `;
        }

        // 更新文章列表的活跃状态
        this.renderPostsList();
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // 开始跟踪阅读进度
        this.startReadingProgressTracking(filename);
        
        // 更新URL
        this.updateURL(filename);
    }

    /**
     * 获取文章导航
     */
    getPostNavigation(currentFilename) {
        const currentIndex = this.posts.findIndex(p => p.filename === currentFilename);
        const prevPost = this.posts[currentIndex - 1];
        const nextPost = this.posts[currentIndex + 1];
        
        let navigation = '<div class="post-nav">';
        
        if (prevPost) {
            navigation += `<a href="#" onclick="blogSystem.showPost('${prevPost.filename}')" class="nav-prev">← ${prevPost.title}</a>`;
        }
        
        if (nextPost) {
            navigation += `<a href="#" onclick="blogSystem.showPost('${nextPost.filename}')" class="nav-next">${nextPost.title} →</a>`;
        }
        
        navigation += '</div>';
        return navigation;
    }

    /**
     * 开始跟踪阅读进度
     */
    startReadingProgressTracking(filename) {
        const article = document.querySelector('.blog-post');
        if (!article) return;

        const progressBar = document.getElementById('reading-progress');
        if (!progressBar) return;

        const updateProgress = () => {
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.pageYOffset;
            
            const progress = Math.min(100, Math.max(0, 
                ((scrollTop - articleTop + windowHeight) / articleHeight) * 100
            ));
            
            progressBar.style.width = `${progress}%`;
            this.readingProgress.set(filename, progress);
            this.saveReadingProgress();
        };

        // 移除之前的监听器
        window.removeEventListener('scroll', this.scrollHandler);
        
        // 添加新的监听器
        this.scrollHandler = this.throttle(updateProgress, 100);
        window.addEventListener('scroll', this.scrollHandler);
        
        // 初始更新
        updateProgress();
    }

    /**
     * 显示文章列表
     */
    showPostList() {
        this.currentPost = null;
        const postContent = document.getElementById('post-content');
        
        if (postContent) {
            postContent.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">👋</div>
                    <h2>欢迎来到我的博客</h2>
                    <p>这里有 ${this.posts.length} 篇文章等待您的阅读</p>
                    <div class="welcome-actions">
                        <button onclick="blogSystem.showRandomPost()" class="action-btn">🎲 随机阅读</button>
                        <button onclick="blogSystem.showLatestPost()" class="action-btn">📰 最新文章</button>
                    </div>
                </div>
            `;
        }
        
        this.renderPostsList();
        this.updateURL();
        
        // 移除阅读进度跟踪
        window.removeEventListener('scroll', this.scrollHandler);
        document.getElementById('reading-progress').style.width = '0%';
    }

    /**
     * 显示随机文章
     */
    showRandomPost() {
        const randomPost = this.posts[Math.floor(Math.random() * this.posts.length)];
        this.showPost(randomPost.filename);
    }

    /**
     * 显示最新文章
     */
    showLatestPost() {
        if (this.posts.length > 0) {
            this.showPost(this.posts[0].filename);
        }
    }

    /**
     * 搜索文章
     */
    searchPosts(term) {
        const startTime = performance.now();
        this.searchTerm = term;
        
        // 添加到搜索历史
        if (term && !this.searchHistory.includes(term)) {
            this.searchHistory.unshift(term);
            this.searchHistory = this.searchHistory.slice(0, 10); // 保留最近10次搜索
            this.saveSearchHistory();
        }
        
        this.renderPostsList();
        
        // 显示搜索结果
        const filteredPosts = this.getFilteredPosts();
        
        if (filteredPosts.length === 0 && term) {
            const postContent = document.getElementById('post-content');
            if (postContent) {
                postContent.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <h2>未找到相关文章</h2>
                        <p>没有找到包含 "${term}" 的文章，请尝试其他关键词。</p>
                        <div class="search-suggestions">
                            <h3>搜索建议：</h3>
                            <ul>
                                <li>检查拼写是否正确</li>
                                <li>尝试使用更简单的关键词</li>
                                <li>使用标签进行筛选</li>
                            </ul>
                        </div>
                        <button onclick="blogSystem.showPostList()" class="btn-primary">返回所有文章</button>
                    </div>
                `;
            }
        } else if (term === '') {
            this.showPostList();
        }
        
        this.performanceMetrics.searchTime = performance.now() - startTime;
    }

    /**
     * 获取过滤后的文章
     */
    getFilteredPosts() {
        if (!this.searchTerm) return this.posts;
        
        const term = this.searchTerm.toLowerCase();
        return this.posts.filter(post => 
            post.title.toLowerCase().includes(term) ||
            post.content.toLowerCase().includes(term) ||
            post.tags.some(tag => tag.toLowerCase().includes(term))
        );
    }

    /**
     * 编辑文章
     */
    editPost(filename) {
        const post = this.posts.find(p => p.filename === filename);
        if (!post) return;

        const postContent = document.getElementById('post-content');
        if (postContent) {
            postContent.innerHTML = `
                <div class="post-editor">
                    <div class="editor-header">
                        <h2>编辑文章: ${post.title}</h2>
                        <div class="editor-controls">
                            <button onclick="blogSystem.togglePreview()" class="btn-secondary">预览</button>
                            <button onclick="blogSystem.savePost('${filename}')" class="btn-primary">💾 保存</button>
                            <button onclick="blogSystem.showPost('${filename}')" class="btn-danger">❌ 取消</button>
                        </div>
                    </div>
                    
                    <div class="editor-content">
                        <div class="editor-panel">
                            <textarea id="edit-markdown" 
                                      placeholder="在此输入Markdown内容...">${post.markdown}</textarea>
                        </div>
                        <div class="preview-panel" id="preview-panel" style="display: none;">
                            <div id="preview-content"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // 设置编辑器
            this.setupEditor();
        }
    }

    /**
     * 设置编辑器
     */
    setupEditor() {
        const textarea = document.getElementById('edit-markdown');
        if (!textarea) return;

        // 自动调整高度
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';

        // 监听输入变化
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
            this.updatePreview();
        });

        // 初始预览
        this.updatePreview();
    }

    /**
     * 更新预览
     */
    updatePreview() {
        const textarea = document.getElementById('edit-markdown');
        const previewContent = document.getElementById('preview-content');
        
        if (textarea && previewContent) {
            const markdown = textarea.value;
            const html = this.markdownParser ? this.markdownParser.parse(markdown) : markdown;
            previewContent.innerHTML = html;
        }
    }

    /**
     * 切换预览模式
     */
    togglePreview() {
        const editorPanel = document.querySelector('.editor-panel');
        const previewPanel = document.getElementById('preview-panel');
        
        if (editorPanel && previewPanel) {
            const isPreviewVisible = previewPanel.style.display !== 'none';
            
            if (isPreviewVisible) {
                editorPanel.style.display = 'block';
                previewPanel.style.display = 'none';
            } else {
                editorPanel.style.display = 'none';
                previewPanel.style.display = 'block';
                this.updatePreview();
            }
        }
    }

    /**
     * 保存文章
     */
    savePost(filename) {
        const textarea = document.getElementById('edit-markdown');
        if (!textarea) return;

        const newMarkdown = textarea.value;
        
        // 更新文章内容
        const post = this.posts.find(p => p.filename === filename);
        if (post) {
            post.markdown = newMarkdown;
            post.content = this.markdownParser ? this.markdownParser.parse(newMarkdown) : newMarkdown;
            post.metadata = this.extractMetadata(newMarkdown);
            post.wordCount = this.countWords(newMarkdown);
            post.readingTime = this.calculateReadingTime(newMarkdown);
        }

        // 显示更新后的文章
        this.showPost(filename);
        
        console.log(`✅ 文章 ${filename} 已更新`);
        this.showNotification('文章已保存', 'success');
    }

    /**
     * 分享文章
     */
    sharePost(filename) {
        const post = this.posts.find(p => p.filename === filename);
        if (!post) return;

        const shareData = {
            title: post.title,
            text: `阅读《${post.title}》`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // 复制到剪贴板
            navigator.clipboard.writeText(shareData.url).then(() => {
                this.showNotification('链接已复制到剪贴板', 'success');
            });
        }
    }

    /**
     * 主题切换
     */
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.theme);
        this.saveTheme();
    }

    /**
     * 应用主题
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    /**
     * 字体大小调整
     */
    adjustFontSize() {
        const currentSize = parseInt(getComputedStyle(document.documentElement).fontSize);
        const sizes = [14, 16, 18, 20];
        const currentIndex = sizes.indexOf(currentSize);
        const nextIndex = (currentIndex + 1) % sizes.length;
        
        document.documentElement.style.fontSize = sizes[nextIndex] + 'px';
        this.showNotification(`字体大小已调整为 ${sizes[nextIndex]}px`, 'info');
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * 显示错误消息
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>❌ 错误</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn-primary">刷新页面</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    /**
     * 格式化日期
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    /**
     * 节流函数
     */
    throttle(func, wait) {
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

    /**
     * 更新URL
     */
    updateURL(filename = '') {
        const url = filename ? `#post/${filename}` : '#';
        history.pushState(null, null, url);
    }

    /**
     * 预加载关键资源
     */
    async preloadCriticalResources() {
        // 预加载代码高亮库
        const hljsScript = document.createElement('script');
        hljsScript.src = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/highlight.min.js';
        document.head.appendChild(hljsScript);
        
        // 预加载CSS
        const hljsCSS = document.createElement('link');
        hljsCSS.rel = 'stylesheet';
        hljsCSS.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css';
        document.head.appendChild(hljsCSS);
    }

    /**
     * 设置Service Worker
     */
    async setupServiceWorker() {
        // 在本地文件环境中跳过Service Worker注册
        if (window.location.protocol === 'file:') {
            console.log('📝 本地文件环境，跳过Service Worker注册');
            return;
        }
        
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker 注册成功');
            } catch (error) {
                console.log('⚠️ Service Worker 注册失败:', error);
            }
        }
    }

    /**
     * 设置性能监控
     */
    setupPerformanceMonitoring() {
        // 监控页面性能
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('📊 性能数据:', {
                        'DOM加载时间': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart) + 'ms',
                        '页面完全加载时间': Math.round(perfData.loadEventEnd - perfData.loadEventStart) + 'ms',
                        '总加载时间': Math.round(perfData.loadEventEnd - perfData.navigationStart) + 'ms'
                    });
                }
            }, 0);
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('blog-search-input');
        const searchBtn = document.getElementById('blog-search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.searchPosts(e.target.value);
            }, 300));
            
            // 搜索建议
            searchInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const searchInput = document.getElementById('blog-search-input');
                if (searchInput) {
                    this.searchPosts(searchInput.value);
                }
            });
        }

        // 主题切换
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // 字体大小调整
        const fontSizeToggle = document.getElementById('font-size-toggle');
        if (fontSizeToggle) {
            fontSizeToggle.addEventListener('click', () => {
                this.adjustFontSize();
            });
        }

        // 排序控制
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortPosts(e.target.value);
            });
        }

        // 文章列表点击事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.post-item')) {
                const postItem = e.target.closest('.post-item');
                const filename = postItem.dataset.filename;
                if (filename) {
                    this.showPost(filename);
                }
            }
            
            // 标签点击事件
            if (e.target.closest('.tag-cloud-item')) {
                const tagItem = e.target.closest('.tag-cloud-item');
                const tag = tagItem.dataset.tag;
                if (tag) {
                    this.searchPosts(tag);
                }
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'f':
                        e.preventDefault();
                        const searchInput = document.getElementById('blog-search-input');
                        if (searchInput) {
                            searchInput.focus();
                        }
                        break;
                    case 'b':
                        e.preventDefault();
                        this.showPostList();
                        break;
                    case 'e':
                        e.preventDefault();
                        if (this.currentPost) {
                            this.editPost(this.currentPost.filename);
                        }
                        break;
                }
            }
            
            // ESC键
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('blog-search-input');
                if (searchInput && document.activeElement === searchInput) {
                    searchInput.blur();
                }
            }
        });

        // 处理浏览器前进后退
        window.addEventListener('popstate', () => {
            const hash = window.location.hash;
            if (hash.startsWith('#post/')) {
                const filename = hash.replace('#post/', '');
                this.showPost(filename);
            } else {
                this.showPostList();
            }
        });
    }

    /**
     * 显示搜索建议
     */
    showSearchSuggestions() {
        const suggestions = document.getElementById('search-suggestions');
        if (!suggestions) return;

        if (this.searchHistory.length === 0) {
            suggestions.style.display = 'none';
            return;
        }

        const suggestionsHtml = this.searchHistory.map(term => 
            `<div class="suggestion-item" onclick="blogSystem.searchPosts('${term}')">${term}</div>`
        ).join('');

        suggestions.innerHTML = suggestionsHtml;
        suggestions.style.display = 'block';
    }

    /**
     * 排序文章
     */
    sortPosts(sortBy) {
        switch (sortBy) {
            case 'title':
                this.posts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'reading-time':
                this.posts.sort((a, b) => a.readingTime - b.readingTime);
                break;
            case 'date':
            default:
                this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }
        this.renderPostsList();
    }

    /**
     * 检测当前页面是否是博客页面
     */
    isBlogPage() {
        // 检查URL路径
        const path = window.location.pathname;
        const isBlogPath = path.includes('blog') || path.includes('posts') || path.endsWith('.html') && path.includes('blog');
        
        // 检查页面标题
        const title = document.title.toLowerCase();
        const isBlogTitle = title.includes('博客') || title.includes('blog');
        
        // 检查页面内容
        const hasBlogContent = document.querySelector('.blog-section, .blog-content, #blog, .blog, [data-section="blog"]');
        
        // 检查是否有博客相关的meta标签
        const hasBlogMeta = document.querySelector('meta[name="page-type"][content="blog"]') || 
                           document.querySelector('meta[property="og:type"][content="article"]');
        
        // 如果是博客页面，返回true
        if (isBlogPath || isBlogTitle || hasBlogContent || hasBlogMeta) {
            return true;
        }
        
        // 检查当前页面是否是主页（index.html）
        if (path.endsWith('index.html') || path.endsWith('/') || path.endsWith('\\')) {
            return false; // 主页不显示博客界面
        }
        
        // 检查是否是其他特定页面
        const otherPages = ['about', 'contact', 'products', 'services', 'privacy', 'terms'];
        const isOtherPage = otherPages.some(page => path.includes(page));
        
        if (isOtherPage) {
            return false; // 其他页面不显示博客界面
        }
        
        // 默认情况下，如果不是明确标识的博客页面，则不显示博客界面
        return false;
    }

    /**
     * 本地存储相关方法
     */
    saveTheme() {
        localStorage.setItem('blog-theme', this.theme);
    }

    loadTheme() {
        return localStorage.getItem('blog-theme') || 'light';
    }

    saveSearchHistory() {
        localStorage.setItem('blog-search-history', JSON.stringify(this.searchHistory));
    }

    loadSearchHistory() {
        const saved = localStorage.getItem('blog-search-history');
        return saved ? JSON.parse(saved) : [];
    }

    saveReadingProgress() {
        const progress = Object.fromEntries(this.readingProgress);
        localStorage.setItem('blog-reading-progress', JSON.stringify(progress));
    }

    loadReadingProgress() {
        const saved = localStorage.getItem('blog-reading-progress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.readingProgress = new Map(Object.entries(progress));
        }
    }

    restoreReadingProgress() {
        this.loadReadingProgress();
    }
}

// 导出博客系统类（供其他模块使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedBlogSystem;
}

// 如果不在模块环境中，将类设置为全局变量供其他脚本使用
if (typeof window !== 'undefined') {
    window.OptimizedBlogSystem = OptimizedBlogSystem;
}
