// 音乐网站核心功能类
class MusicWebsiteCore {
    constructor() {
        this.musicWorks = [];
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        this.konamiIndex = 0;
        this.eventListeners = new Set();
    }

    // 音乐作品展示
    setupMusicWorks() {
        // 模拟音乐作品数据
        this.musicWorks = [
            {
                id: 1,
                title: "巴赫平均律钢琴曲集",
                composer: "约翰·塞巴斯蒂安·巴赫",
                genre: "古典",
                year: "1722-1742",
                description: "被誉为钢琴音乐的《旧约圣经》，包含48首前奏曲与赋格。",
                image: "images/古典.jpg",
                audio: "audio/bach-prelude.mp3"
            },
            {
                id: 2,
                title: "蓝色狂想曲",
                composer: "乔治·格什温",
                genre: "爵士",
                year: "1924",
                description: "融合古典音乐与爵士乐元素的经典作品。",
                image: "images/实验.jpg",
                audio: "audio/blue-rhapsody.mp3"
            },
            {
                id: 3,
                title: "Always",
                composer: "Bon Jovi",
                genre: "流行",
                year: "1994",
                description: "经典摇滚情歌，传唱度极高的流行金曲。",
                image: "images/always.png",
                audio: "audio/always.mp3"
            },
            {
                id: 4,
                title: "Blond",
                composer: "Frank Ocean",
                genre: "实验",
                year: "2016",
                description: "前卫的实验性音乐作品，突破传统音乐界限。",
                image: "images/blond.jpg",
                audio: "audio/blond.mp3"
            }
        ];

        this.renderFilterButtons();
        this.renderMusicWorks();
    }

    renderFilterButtons() {
        const filterContainer = document.getElementById('filter-buttons');
        if (!filterContainer) return;

        filterContainer.innerHTML = ''; // 清空旧按钮

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
        
        worksContainer.innerHTML = worksToRender.map(work => `
            <div class="work-card" data-genre="${work.genre}">
                <div class="work-image">
                    <img src="${work.image}" alt="${work.title}" loading="lazy">
                    <div class="work-overlay">
                        <button class="play-button" data-audio="${work.audio}">
                            <span class="play-icon">▶</span>
                        </button>
                    </div>
                </div>
                <div class="work-info">
                    <h3 class="work-title">${work.title}</h3>
                    <p class="work-composer">${work.composer}</p>
                    <p class="work-year">${work.year}</p>
                    <p class="work-description">${work.description}</p>
                    <span class="work-genre">${work.genre}</span>
                </div>
            </div>
        `).join('');

        // 添加播放按钮事件
        worksContainer.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const audioSrc = button.dataset.audio;
                this.playAudio(audioSrc);
            });
        });
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

        // 添加过渡动画
        const worksContainer = document.getElementById('works-grid');
        worksContainer.style.opacity = '0';
        worksContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            this.renderMusicWorks(filteredWorks);
            worksContainer.style.opacity = '1';
            worksContainer.style.transform = 'translateY(0)';
        }, 200);
    }

    // 播放音频
    playAudio(audioSrc) {
        // 停止当前播放的音频
        const currentAudio = document.querySelector('audio');
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.remove();
        }

        // 创建新的音频元素
        const audio = document.createElement('audio');
        audio.src = audioSrc;
        audio.controls = true;
        audio.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background: rgba(0,0,0,0.8);
            border-radius: 8px;
            padding: 10px;
        `;
        
        document.body.appendChild(audio);
        audio.play().catch(e => console.log('音频播放失败:', e));
    }

    // Konami Code 彩蛋
    setupKonamiCode() {
        document.addEventListener('keydown', (e) => {
            if (e.code === this.konamiCode[this.konamiIndex]) {
                this.konamiIndex++;
                if (this.konamiIndex === this.konamiCode.length) {
                    this.triggerKonamiCode();
                    this.konamiIndex = 0;
                }
            } else {
                this.konamiIndex = 0;
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
        
        // 创建音符雨
        this.createNoteRain();
        
        // 创建五线谱波动
        this.createStaffWave();
        
        // 3秒后恢复正常
        setTimeout(() => {
            body.style.animation = '';
            style.remove();
        }, 3000);
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
            z-index: 1000;
            overflow: hidden;
        `;
        
        document.body.appendChild(container);
        
        // 创建音符
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const note = document.createElement('div');
                note.textContent = notes[Math.floor(Math.random() * notes.length)];
                note.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    top: -50px;
                    font-size: ${Math.random() * 20 + 16}px;
                    color: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3});
                    animation: noteFall ${Math.random() * 3 + 2}s linear forwards;
                `;
                
                container.appendChild(note);
                
                // 动画结束后移除
                setTimeout(() => note.remove(), 5000);
            }, i * 100);
        }
        
        // 添加CSS动画
        if (!document.getElementById('note-rain-style')) {
            const style = document.createElement('style');
            style.id = 'note-rain-style';
            style.textContent = `
                @keyframes noteFall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 5秒后移除容器
        setTimeout(() => container.remove(), 5000);
    }

    // 五线谱波动动画
    createStaffWave() {
        const container = document.createElement('div');
        container.className = 'staff-wave-container';
        container.style.cssText = `
            position: fixed;
            bottom: 50px;
            left: 0;
            width: 100%;
            height: 100px;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
        `;
        
        document.body.appendChild(container);
        
        // 创建五线谱
        const staff = document.createElement('div');
        staff.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: repeating-linear-gradient(
                to bottom,
                transparent 0,
                transparent 18px,
                #333 18px,
                #333 20px
            );
            animation: staffWave 2s ease-in-out infinite;
        `;
        
        container.appendChild(staff);
        
        // 添加CSS动画
        if (!document.getElementById('staff-wave-style')) {
            const style = document.createElement('style');
            style.id = 'staff-wave-style';
            style.textContent = `
                @keyframes staffWave {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 5秒后移除容器
        setTimeout(() => container.remove(), 5000);
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

    // 性能优化设置
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

    // 预加载关键资源
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

    // 设置资源提示
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
        const preconnect = ['//fonts.gstatic.com'];
        preconnect.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    // 图片懒加载
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
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // 性能监控
    setupPerformanceMonitoring() {
        // 监控页面加载性能
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                console.log(`页面加载时间: ${loadTime}ms`);
                
                // 如果加载时间过长，可以发送到分析服务
                if (loadTime > 3000) {
                    this.reportPerformanceIssue('slow_load', loadTime);
                }
            }, 0);
        });

        // 监控长任务
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.duration > 50) {
                        this.reportPerformanceIssue('long_task', entry.duration);
                    }
                });
            });
            observer.observe({ entryTypes: ['longtask'] });
        }
    }

    // 内存管理
    setupMemoryManagement() {
        // 清理事件监听器
        this.eventListeners = new Set();
        
        // 页面卸载时清理资源
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    // 清理资源
    cleanup() {
        // 清理事件监听器
        if (this.eventListeners) {
            this.eventListeners.forEach(listener => {
                document.removeEventListener(listener.type, listener.handler);
            });
            this.eventListeners.clear();
        }
        
        // 清理音频元素
        const audios = document.querySelectorAll('audio');
        audios.forEach(audio => {
            audio.pause();
            audio.remove();
        });
        
        // 清理动画元素
        const animatedElements = document.querySelectorAll('.note-rain-container, .staff-wave-container');
        animatedElements.forEach(el => el.remove());
        
        // 清理样式
        const dynamicStyles = document.querySelectorAll('#note-rain-style, #staff-wave-style');
        dynamicStyles.forEach(style => style.remove());
        
        // 清理粒子动画
        if (window.uiEffectsManager) {
            window.uiEffectsManager.cleanup();
        }
        
        // 清理地图
        if (window.mapManager && window.mapManager.mapInstance) {
            window.mapManager.mapInstance.remove();
        }
        
        // 清理窗口事件监听器
        if (this.debouncedResize) {
            window.removeEventListener('resize', this.debouncedResize);
        }
    }

    // 报告性能问题
    reportPerformanceIssue(type, value) {
        // 这里可以发送到性能监控服务
        console.warn(`性能问题: ${type} = ${value}`);
    }

    // 添加事件监听器（用于内存管理）
    addEventListener(type, handler) {
        document.addEventListener(type, handler);
        this.eventListeners.add({ type, handler });
    }

    // 移除事件监听器
    removeEventListener(type, handler) {
        document.removeEventListener(type, handler);
        this.eventListeners.delete({ type, handler });
    }
}
