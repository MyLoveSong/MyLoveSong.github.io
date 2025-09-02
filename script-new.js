// 音乐盛宴网站 - 模块化JavaScript功能
// 主入口文件，负责初始化和协调各个模块

// GitHub API 配置
const GITHUB_API_CONFIG = {
    baseUrl: 'https://api.github.com',
    username: 'MyLoveSong', // 真实GitHub用户：XIE ZEYU
    perPage: 50, // 增加每页数量以获取更多项目
    // 添加Personal Access Token支持（可选）
    // 获取方式：GitHub -> Settings -> Developer settings -> Personal access tokens -> Tokens (classic)
    // 权限：只需要 public_repo 和 read:user 权限即可
    token: '', // 请在此处填入您的GitHub Personal Access Token（已移除硬编码Token）
    // 或者通过环境变量设置：process.env.GITHUB_TOKEN
    useAuth: false, // 默认关闭认证，避免401错误
    // 添加重试配置
    maxRetries: 3,
    retryDelay: 2000, // 重试延迟（毫秒）
    // 添加缓存配置
    cacheEnabled: true,
    cacheDuration: 30 * 60 * 1000 // 30分钟缓存
};

// 全局变量 - 使用var避免重复声明错误
var projectManager;
var skillVisualizer;
var timelineManager;
var blogSystem;
var mapManager;
var themeManager;
var uiEffectsManager;
var musicWebsiteCore;

// 检查是否已经声明过这些变量
if (typeof window.projectManager !== 'undefined') {
    projectManager = window.projectManager;
}
if (typeof window.skillVisualizer !== 'undefined') {
    skillVisualizer = window.skillVisualizer;
}
if (typeof window.timelineManager !== 'undefined') {
    timelineManager = window.timelineManager;
}
if (typeof window.blogSystem !== 'undefined') {
    blogSystem = window.blogSystem;
}
if (typeof window.mapManager !== 'undefined') {
    mapManager = window.mapManager;
}
if (typeof window.themeManager !== 'undefined') {
    themeManager = window.themeManager;
}
if (typeof window.uiEffectsManager !== 'undefined') {
    uiEffectsManager = window.uiEffectsManager;
}
if (typeof window.musicWebsiteCore !== 'undefined') {
    musicWebsiteCore = window.musicWebsiteCore;
}

// 页面加载进度管理
class LoadingManager {
    constructor() {
        this.progress = 0;
        this.totalSteps = 8; // 总加载步骤数
        this.currentStep = 0;
        this.progressBar = document.getElementById('loading-progress');
        this.loadingOverlay = document.getElementById('page-loading');
    }

    updateProgress(step, message = '') {
        this.currentStep = step;
        this.progress = (step / this.totalSteps) * 100;
        
        if (this.progressBar) {
            this.progressBar.style.width = `${this.progress}%`;
        }
        
        console.log(`📊 加载进度: ${this.progress.toFixed(1)}% - ${message}`);
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                this.loadingOverlay.style.display = 'none';
            }, 500);
        }
        
        if (this.progressBar) {
            this.progressBar.style.width = '100%';
            setTimeout(() => {
                this.progressBar.style.display = 'none';
            }, 1000);
        }
    }
}

// 全局加载管理器
const loadingManager = new LoadingManager();

// 主初始化函数
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 音乐盛宴网站正在初始化...');
    loadingManager.updateProgress(1, 'DOM加载完成');
    
    // 初始化各个模块
    initializeModules();
    
    // 设置全局变量供其他模块使用
    setupGlobalVariables();
    
    console.log('✅ 音乐盛宴网站初始化完成！');
    loadingManager.updateProgress(8, '初始化完成');
    
    // 延迟隐藏加载界面，确保所有内容都已加载
    setTimeout(() => {
        loadingManager.hideLoading();
    }, 1000);
});

// 检测当前页面是否是博客页面
function isBlogPage() {
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

// 初始化所有模块
function initializeModules() {
    try {
        loadingManager.updateProgress(2, '初始化项目管理器');
        
        // 1. 项目管理器
        if (typeof ProjectManager !== 'undefined') {
            projectManager = new ProjectManager();
            if (projectManager.setupContactForm) {
                projectManager.setupContactForm();
            }
            if (projectManager.fetchProjects) {
                projectManager.fetchProjects(); // 获取GitHub项目数据
            }
        } else {
            console.warn('⚠️ ProjectManager 类未定义');
        }
        
        loadingManager.updateProgress(3, '初始化技能可视化器');
        
        // 2. 技能可视化器
        if (typeof SkillVisualizer !== 'undefined') {
            skillVisualizer = new SkillVisualizer();
            if (skillVisualizer.initSkillBars) skillVisualizer.initSkillBars();
            if (skillVisualizer.initRadarChart) skillVisualizer.initRadarChart();
        } else {
            console.warn('⚠️ SkillVisualizer 类未定义');
        }
        
        loadingManager.updateProgress(4, '初始化时间轴管理器');
        
        // 3. 时间轴管理器
        if (typeof TimelineManager !== 'undefined') {
            timelineManager = new TimelineManager();
            if (timelineManager.initTimeline) timelineManager.initTimeline();
        } else {
            console.warn('⚠️ TimelineManager 类未定义');
        }
        
        loadingManager.updateProgress(5, '初始化博客系统');
        
        // 4. 博客系统 - 只在博客页面初始化
        if (typeof OptimizedBlogSystem !== 'undefined') {
            // 检查当前页面是否是博客页面
            const isBlogPage = this.isBlogPage();
            if (isBlogPage) {
                blogSystem = new OptimizedBlogSystem();
                console.log('📚 博客系统已初始化（博客页面）');
            } else {
                console.log('📝 当前页面不是博客页面，跳过博客系统初始化');
                blogSystem = null;
            }
        } else {
            console.warn('⚠️ OptimizedBlogSystem 类未定义');
        }
        
        loadingManager.updateProgress(6, '初始化主题管理器');
        
        // 5. 主题管理器
        if (typeof ThemeManager !== 'undefined') {
            themeManager = new ThemeManager();
            if (themeManager.setupTheme) themeManager.setupTheme();
        } else {
            console.warn('⚠️ ThemeManager 类未定义');
        }
        
        loadingManager.updateProgress(7, '初始化UI效果管理器');
        
        // 6. UI效果管理器
        if (typeof UIEffectsManager !== 'undefined') {
            uiEffectsManager = new UIEffectsManager();
            const uiMethods = [
                'setupTypingEffect', 'setupCustomCursor', 'setupSmoothScrolling',
                'setupIntersectionObserver', 'setupHobbyExpansion', 'setupParticleBackground',
                'setupPageTransitions', 'setupNavigationHighlight', 'setupLoadingProgress',
                'setupButtonEffects', 'setupPaymentEffects', 'setupMusicDecorations',
                'setupParallaxEffect', 'setupMouseParticles', 'setupScrollAnimations',
                'setupPageVisibility'
            ];
            uiMethods.forEach(method => {
                if (uiEffectsManager[method]) {
                    uiEffectsManager[method]();
                }
            });
        } else {
            console.warn('⚠️ UIEffectsManager 类未定义');
        }
        
        // 7. 地图管理器
        if (typeof MapManager !== 'undefined') {
            console.log('🗺️ 初始化地图管理器...');
            try {
                mapManager = new MapManager();
                
                // 检查地图状态
                setTimeout(() => {
                    if (mapManager) {
                        console.log('🔍 检查地图状态...');
                        try {
                            const status = mapManager.checkMapStatus();
                            
                            if (status.leafletLoaded && status.mapContainer) {
                                console.log('✅ 地图环境检查通过，开始初始化...');
                                mapManager.setupTravelMap().catch(error => {
                                    console.warn('⚠️ 地图初始化失败，但不影响其他功能:', error.message);
                                    // 显示友好的错误提示
                                    const mapEl = document.getElementById('map');
                                    if (mapEl) {
                                        mapEl.innerHTML = `
                                            <div style="
                                                display: flex; flex-direction: column; justify-content: center; 
                                                align-items: center; height: 100%; color: #6b7280; text-align: center; padding: 2rem;
                                            ">
                                                <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
                                                <div style="font-size: 1.2rem; margin-bottom: 1rem;">地图暂时不可用</div>
                                                <div style="color: #9ca3af; margin-bottom: 1.5rem;">地图功能正在维护中，其他功能正常使用</div>
                                            </div>
                                        `;
                                    }
                                });
                            } else {
                                console.warn('⚠️ 地图环境检查失败，但不影响其他功能:', status);
                                // 延迟重试
                                setTimeout(() => {
                                    if (mapManager) {
                                        console.log('🔄 延迟重试地图初始化...');
                                        mapManager.setupTravelMap().catch(error => {
                                            console.warn('⚠️ 地图重试初始化失败，但不影响其他功能:', error.message);
                                        });
                                    }
                                }, 2000);
                            }
                        } catch (error) {
                            console.warn('⚠️ 地图状态检查失败，但不影响其他功能:', error.message);
                        }
                    }
                }, 1000); // 增加延迟时间
            } catch (error) {
                console.warn('⚠️ 地图管理器创建失败，但不影响其他功能:', error.message);
                mapManager = null;
            }
        } else {
            console.warn('⚠️ MapManager 类未定义，但不影响其他功能');
        }
        
        // 8. 音乐网站核心功能
        if (typeof MusicWebsiteCore !== 'undefined') {
            musicWebsiteCore = new MusicWebsiteCore();
            const coreMethods = [
                'setupPerformanceOptimizations', 'setupMusicWorks',
                'setupKonamiCode', 'setupPageVisibility'
            ];
            coreMethods.forEach(method => {
                if (musicWebsiteCore[method]) {
                    musicWebsiteCore[method]();
                }
            });
        } else {
            console.warn('⚠️ MusicWebsiteCore 类未定义');
        }
        
        console.log('✅ 所有模块初始化完成');
        
    } catch (error) {
        console.error('❌ 模块初始化失败:', error);
    }
}

// 设置全局变量
function setupGlobalVariables() {
    // 将管理器实例设置为全局变量，供其他模块使用
    window.projectManager = projectManager;
    window.skillVisualizer = skillVisualizer;
    window.timelineManager = timelineManager;
    window.blogSystem = blogSystem;
    window.mapManager = mapManager;
    window.themeManager = themeManager;
    window.uiEffectsManager = uiEffectsManager;
    window.musicWebsiteCore = musicWebsiteCore;
    
    // 设置全局函数
    window.filterMapByType = (type) => {
        if (mapManager) {
            mapManager.filterMapByType(type, window.mapInstance, window.allMarkersGroup, window.allCityData, window.allCityData);
        }
    };
    
    window.showCityDetails = (cityName) => {
        if (mapManager) {
            const city = window.allCityData.find(c => c.name === cityName);
            if (city) {
                mapManager.showCityDetails(city);
            }
        }
    };

    // 地图调试函数
    window.debugMap = () => {
        console.log('🔍 地图调试信息:');
        console.log('mapManager:', mapManager);
        if (mapManager) {
            const status = mapManager.checkMapStatus();
            console.log('地图状态:', status);
            
            if (status.mapContainer) {
                const mapEl = document.getElementById('map');
                console.log('地图容器:', mapEl);
                console.log('地图容器HTML:', mapEl.innerHTML);
            }
        }
        
        console.log('Leaflet库:', typeof L !== 'undefined' ? L.version : '未加载');
        console.log('页面状态:', document.readyState);
    };

    // 手动初始化地图
    window.initMap = () => {
        if (mapManager) {
            console.log('🔄 手动初始化地图...');
            mapManager.manualInit();
        } else {
            console.error('❌ mapManager 未定义');
        }
    };

    // 强制重新初始化地图
    window.reinitMap = () => {
        if (mapManager) {
            console.log('🔄 强制重新初始化地图...');
            mapManager.forceReinit();
        } else {
            console.error('❌ mapManager 未定义');
        }
    };
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    console.log('🧹 正在清理资源...');
    
    // 清理各个模块
    if (uiEffectsManager) {
        uiEffectsManager.cleanup();
    }
    
    if (musicWebsiteCore) {
        musicWebsiteCore.cleanup();
    }
    
    if (mapManager && mapManager.mapInstance) {
        mapManager.mapInstance.remove();
    }
    
    console.log('✅ 资源清理完成');
});

// 错误处理
window.addEventListener('error', function(event) {
    console.error('❌ 全局错误:', event.error);
    
    // 可以在这里添加错误报告逻辑
    if (musicWebsiteCore && event.error && event.error.message) {
        musicWebsiteCore.reportPerformanceIssue('javascript_error', event.error.message);
    }
});

// 性能监控
window.addEventListener('load', function() {
    // 页面加载完成后的性能统计
    setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            console.log(`📊 页面加载时间: ${loadTime.toFixed(2)}ms`);
            
            if (musicWebsiteCore && loadTime > 3000) {
                musicWebsiteCore.reportPerformanceIssue('slow_load', loadTime);
            }
        }
    }, 0);
});

// 导出模块（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ProjectManager,
        SkillVisualizer,
        TimelineManager,
        OptimizedBlogSystem,
        MapManager,
        ThemeManager,
        UIEffectsManager,
        MusicWebsiteCore
    };
}
