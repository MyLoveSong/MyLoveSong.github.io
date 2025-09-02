// 时间轴管理类
class TimelineManager {
    constructor() {
        this.timelineData = [
            {
                year: '2024',
                title: '音乐网站开发',
                description: '使用现代Web技术栈开发个人音乐主题网站，集成多种交互功能',
                details: '采用HTML5、CSS3、JavaScript ES6+技术，实现了响应式设计、主题切换、动画效果等功能。集成了GitHub API、地图服务、博客系统等第三方服务。'
            },
            {
                year: '2023',
                title: '前端技能提升',
                description: '深入学习React、Vue等现代前端框架',
                details: '完成了多个React项目，掌握了组件化开发、状态管理、路由等核心概念。同时学习了Vue.js生态系统，包括Vuex、Vue Router等。'
            },
            {
                year: '2022',
                title: 'JavaScript进阶',
                description: '掌握ES6+语法和异步编程',
                details: '学习了Promise、async/await、模块化、闭包等高级概念。完成了多个实战项目，包括数据可视化、API集成等。'
            },
            {
                year: '2021',
                title: 'Web开发入门',
                description: '开始学习HTML、CSS、JavaScript基础',
                details: '从零开始学习Web开发，掌握了HTML语义化标签、CSS布局技术、JavaScript基础语法。完成了第一个个人网站项目。'
            }
        ];
    }

    // 初始化时间轴
    initTimeline() {
        const timelineContainer = document.getElementById('timeline-container');
        if (!timelineContainer) return;

        timelineContainer.innerHTML = this.timelineData.map((item, index) => `
            <div class="timeline-item" data-index="${index}" style="
                position: relative;
                margin-bottom: 3rem;
                padding-left: 3rem;
                opacity: 0;
                transform: translateX(-50px);
                transition: all 0.6s ease;
            ">
                <div class="timeline-marker" style="
                    position: absolute;
                    left: -1.5rem;
                    top: 0.5rem;
                    width: 1rem;
                    height: 1rem;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3);
                    z-index: 2;
                "></div>
                <div class="timeline-line" style="
                    position: absolute;
                    left: -1.25rem;
                    top: 1.5rem;
                    width: 2px;
                    height: calc(100% + 1rem);
                    background: linear-gradient(180deg, #667eea, #764ba2);
                    z-index: 1;
                "></div>
                <div class="timeline-content" style="
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                    border-radius: 15px;
                    border: 1px solid rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px);
                    padding: 2rem;
                    position: relative;
                    transition: all 0.3s ease;
                ">
                    <div class="timeline-year" style="
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: 20px;
                        font-weight: 600;
                        font-size: 0.9rem;
                        display: inline-block;
                        margin-bottom: 1rem;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    ">${item.year}</div>
                    <h3 class="timeline-title" style="
                        color: #ffffff;
                        font-size: 1.5rem;
                        margin-bottom: 1rem;
                        font-weight: 700;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">${item.title}</h3>
                    <p class="timeline-description" style="
                        color: #e5e7eb;
                        line-height: 1.6;
                        margin-bottom: 1.5rem;
                        font-size: 1.1rem;
                    ">${item.description}</p>
                    <div class="timeline-details" style="
                        display: none;
                        background: rgba(0,0,0,0.2);
                        padding: 1.5rem;
                        border-radius: 10px;
                        border-left: 4px solid #667eea;
                        margin-bottom: 1.5rem;
                        color: #d1d5db;
                        line-height: 1.7;
                        font-size: 1rem;
                    ">
                        <p>${item.details}</p>
                    </div>
                    <button class="timeline-toggle" data-index="${index}" style="
                        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                        color: white;
                        border: none;
                        padding: 0.8rem 1.5rem;
                        border-radius: 25px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <span class="toggle-text">展开详情</span>
                        <span class="toggle-icon">▼</span>
                    </button>
                </div>
            </div>
        `).join('');

        this.addTimelineInteractions();
        this.animateTimelineItems();
        this.setupTimelineObserver();
    }

    // 添加时间轴交互
    addTimelineInteractions() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        const toggleButtons = document.querySelectorAll('.timeline-toggle');

        // 增强悬停效果
        timelineItems.forEach((item, index) => {
            // 鼠标进入效果
            item.addEventListener('mouseenter', () => {
                item.classList.add('hovered');
                this.enhanceHoverEffect(item, index);
                this.showTimelinePreview(item, index);
            });
            
            // 鼠标离开效果
            item.addEventListener('mouseleave', () => {
                item.classList.remove('hovered');
                this.removeHoverEffect(item);
                this.hideTimelinePreview();
            });

            // 鼠标移动效果
            item.addEventListener('mousemove', (e) => {
                this.handleMouseMove(item, e);
            });

            // 点击效果
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.timeline-toggle')) {
                    this.triggerTimelineClick(item, index);
                }
            });

            // 键盘导航支持
            item.addEventListener('keydown', (e) => {
                this.handleKeyboardNavigation(e, index);
            });

            // 触摸设备支持
            item.addEventListener('touchstart', (e) => {
                this.handleTouchStart(item, e);
            });

            item.addEventListener('touchend', (e) => {
                this.handleTouchEnd(item, e);
            });
        });

        // 增强点击展开/收起
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(e.currentTarget.dataset.index);
                this.showTimelineDetail(index);
                this.triggerClickAnimation(button);
            });

            // 按钮悬停效果
            button.addEventListener('mouseenter', () => {
                this.enhanceButtonHover(button);
            });

            button.addEventListener('mouseleave', () => {
                this.removeButtonHover(button);
            });
        });

        // 添加全局键盘快捷键
        this.addGlobalKeyboardShortcuts();
        
        // 添加时间轴导航
        this.addTimelineNavigation();
        
        // 添加时间轴搜索功能
        this.addTimelineSearch();
    }

    // 显示时间轴详情
    showTimelineDetail(index) {
        const item = document.querySelector(`[data-index="${index}"]`);
        const details = item.querySelector('.timeline-details');
        const button = item.querySelector('.timeline-toggle');
        const toggleText = button.querySelector('.toggle-text');
        const toggleIcon = button.querySelector('.toggle-icon');

        const isExpanded = details.style.display !== 'none';
        
        if (isExpanded) {
            details.style.display = 'none';
            toggleText.textContent = '展开详情';
            toggleIcon.textContent = '▼';
            item.classList.remove('expanded');
        } else {
            details.style.display = 'block';
            toggleText.textContent = '收起详情';
            toggleIcon.textContent = '▲';
            item.classList.add('expanded');
            
            // 滚动到展开的项目
            setTimeout(() => {
                item.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 100);
        }
    }

    // 动画时间轴项目
    animateTimelineItems() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 200);
        });
    }

    // 设置时间轴观察者
    setupTimelineObserver() {
        if (!('IntersectionObserver' in window)) {
            // 降级处理
            this.animateTimelineItems();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            observer.observe(item);
        });
    }

    // 增强悬停效果
    enhanceHoverEffect(item, index) {
        const marker = item.querySelector('.timeline-marker');
        const content = item.querySelector('.timeline-content');
        
        // 标记发光效果
        marker.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.8), 0 0 40px rgba(102, 126, 234, 0.4)';
        marker.style.transform = 'scale(1.2)';
        marker.style.transition = 'all 0.3s ease';
        
        // 内容区域提升效果
        content.style.transform = 'translateY(-5px) scale(1.02)';
        content.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        content.style.transition = 'all 0.3s ease';
        
        // 添加脉冲动画
        this.addPulseAnimation(marker);
        
        // 显示相关年份提示
        this.showRelatedYears(item, index);
    }

    // 移除悬停效果
    removeHoverEffect(item) {
        const marker = item.querySelector('.timeline-marker');
        const content = item.querySelector('.timeline-content');
        
        marker.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.3)';
        marker.style.transform = 'scale(1)';
        
        content.style.transform = 'translateY(0) scale(1)';
        content.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        
        this.removePulseAnimation(marker);
        this.hideRelatedYears();
    }

    // 添加脉冲动画
    addPulseAnimation(element) {
        element.style.animation = 'timelinePulse 2s infinite';
        
        // 添加CSS动画
        if (!document.getElementById('timeline-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'timeline-pulse-style';
            style.textContent = `
                @keyframes timelinePulse {
                    0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 移除脉冲动画
    removePulseAnimation(element) {
        element.style.animation = '';
    }

    // 显示时间轴预览
    showTimelinePreview(item, index) {
        const data = this.timelineData[index];
        const preview = document.createElement('div');
        preview.className = 'timeline-preview';
        preview.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95));
            backdrop-filter: blur(10px);
            color: white;
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 300px;
            opacity: 0;
            transform: translateY(-50%) translateX(20px);
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        
        preview.innerHTML = `
            <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 0.5rem;">${data.year}</div>
            <h4 style="margin: 0 0 1rem 0; font-size: 1.2rem;">${data.title}</h4>
            <p style="margin: 0; line-height: 1.5; font-size: 0.9rem;">${data.description}</p>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2);">
                <div style="font-size: 0.8rem; opacity: 0.7;">点击查看详细内容</div>
            </div>
        `;
        
        document.body.appendChild(preview);
        
        // 显示动画
        setTimeout(() => {
            preview.style.opacity = '1';
            preview.style.transform = 'translateY(-50%) translateX(0)';
        }, 50);
    }

    // 隐藏时间轴预览
    hideTimelinePreview() {
        const preview = document.querySelector('.timeline-preview');
        if (preview) {
            preview.style.opacity = '0';
            preview.style.transform = 'translateY(-50%) translateX(20px)';
            setTimeout(() => {
                if (preview.parentNode) {
                    preview.parentNode.removeChild(preview);
                }
            }, 300);
        }
    }

    // 处理鼠标移动
    handleMouseMove(item, e) {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 创建跟随鼠标的光点效果
        this.createMouseTrail(x, y, item);
        
        // 根据鼠标位置调整内容倾斜
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        const content = item.querySelector('.timeline-content');
        content.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    }

    // 创建鼠标轨迹
    createMouseTrail(x, y, item) {
        const trail = document.createElement('div');
        trail.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10;
            animation: trailFade 0.5s ease-out forwards;
        `;
        
        item.style.position = 'relative';
        item.appendChild(trail);
        
        // 添加轨迹淡出动画
        if (!document.getElementById('trail-fade-style')) {
            const style = document.createElement('style');
            style.id = 'trail-fade-style';
            style.textContent = `
                @keyframes trailFade {
                    0% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(0.3); }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 500);
    }

    // 触发时间轴点击
    triggerTimelineClick(item, index) {
        // 创建点击波纹效果
        this.createRippleEffect(item);
        
        // 播放点击音效（如果有的话）
        this.playClickSound();
        
        // 高亮当前项目
        this.highlightTimelineItem(item, index);
        
        // 显示快速操作菜单
        this.showQuickActions(item, index);
    }

    // 创建波纹效果
    createRippleEffect(item) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 5;
            animation: rippleExpand 0.6s ease-out;
        `;
        
        item.style.position = 'relative';
        item.appendChild(ripple);
        
        // 添加波纹展开动画
        if (!document.getElementById('ripple-expand-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-expand-style';
            style.textContent = `
                @keyframes rippleExpand {
                    0% { width: 0; height: 0; opacity: 1; }
                    100% { width: 200px; height: 200px; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // 播放点击音效
    playClickSound() {
        // 创建简单的点击音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // 高亮时间轴项目
    highlightTimelineItem(item, index) {
        // 移除其他项目的高亮
        document.querySelectorAll('.timeline-item').forEach(el => {
            el.classList.remove('highlighted');
        });
        
        // 高亮当前项目
        item.classList.add('highlighted');
        item.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))';
        item.style.border = '2px solid rgba(102, 126, 234, 0.5)';
        
        // 3秒后移除高亮
        setTimeout(() => {
            item.classList.remove('highlighted');
            item.style.background = '';
            item.style.border = '';
        }, 3000);
    }

    // 显示快速操作菜单
    showQuickActions(item, index) {
        const actions = document.createElement('div');
        actions.className = 'timeline-quick-actions';
        actions.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 0.5rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 20;
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s ease;
        `;
        
        actions.innerHTML = `
            <button class="quick-action-btn" data-action="expand" title="展开详情">
                📖
            </button>
            <button class="quick-action-btn" data-action="share" title="分享">
                🔗
            </button>
            <button class="quick-action-btn" data-action="bookmark" title="收藏">
                ⭐
            </button>
        `;
        
        // 添加按钮样式
        const style = document.createElement('style');
        style.textContent = `
            .quick-action-btn {
                background: none;
                border: none;
                padding: 0.5rem;
                margin: 0 0.2rem;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s ease;
            }
            .quick-action-btn:hover {
                background: rgba(102, 126, 234, 0.1);
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
        
        item.style.position = 'relative';
        item.appendChild(actions);
        
        // 显示动画
        setTimeout(() => {
            actions.style.opacity = '1';
            actions.style.transform = 'scale(1)';
        }, 50);
        
        // 添加按钮事件
        actions.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            this.handleQuickAction(action, index);
        });
        
        // 3秒后自动隐藏
        setTimeout(() => {
            actions.style.opacity = '0';
            actions.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (actions.parentNode) {
                    actions.parentNode.removeChild(actions);
                }
            }, 300);
        }, 3000);
    }

    // 处理快速操作
    handleQuickAction(action, index) {
        const data = this.timelineData[index];
        
        switch (action) {
            case 'expand':
                this.showTimelineDetail(index);
                break;
            case 'share':
                this.shareTimelineItem(data);
                break;
            case 'bookmark':
                this.bookmarkTimelineItem(data);
                break;
        }
    }

    // 分享时间轴项目
    shareTimelineItem(data) {
        if (navigator.share) {
            navigator.share({
                title: `${data.year} - ${data.title}`,
                text: data.description,
                url: window.location.href
            });
        } else {
            // 降级到复制到剪贴板
            const text = `${data.year} - ${data.title}\n${data.description}`;
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('已复制到剪贴板！');
            });
        }
    }

    // 收藏时间轴项目
    bookmarkTimelineItem(data) {
        const bookmarks = JSON.parse(localStorage.getItem('timelineBookmarks') || '[]');
        const bookmark = {
            id: Date.now(),
            year: data.year,
            title: data.title,
            description: data.description,
            timestamp: new Date().toISOString()
        };
        
        bookmarks.push(bookmark);
        localStorage.setItem('timelineBookmarks', JSON.stringify(bookmarks));
        
        this.showNotification('已添加到收藏！');
    }

    // 显示通知
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 50);
        
        // 3秒后隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 处理键盘导航
    handleKeyboardNavigation(e, index) {
        const items = document.querySelectorAll('.timeline-item');
        let newIndex = index;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                newIndex = Math.min(index + 1, items.length - 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                newIndex = Math.max(index - 1, 0);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.showTimelineDetail(index);
                return;
            case 'Escape':
                this.hideAllDetails();
                return;
        }
        
        if (newIndex !== index) {
            items[newIndex].focus();
            items[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // 处理触摸开始
    handleTouchStart(item, e) {
        item.classList.add('touch-active');
        this.createTouchFeedback(item, e.touches[0]);
    }

    // 处理触摸结束
    handleTouchEnd(item, e) {
        item.classList.remove('touch-active');
        setTimeout(() => {
            item.classList.remove('touch-active');
        }, 150);
    }

    // 创建触摸反馈
    createTouchFeedback(item, touch) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: absolute;
            left: ${touch.clientX - item.getBoundingClientRect().left}px;
            top: ${touch.clientY - item.getBoundingClientRect().top}px;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10;
            animation: touchFeedback 0.3s ease-out;
        `;
        
        item.style.position = 'relative';
        item.appendChild(feedback);
        
        // 添加触摸反馈动画
        if (!document.getElementById('touch-feedback-style')) {
            const style = document.createElement('style');
            style.id = 'touch-feedback-style';
            style.textContent = `
                @keyframes touchFeedback {
                    0% { transform: scale(0); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }

    // 触发点击动画
    triggerClickAnimation(button) {
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }

    // 增强按钮悬停
    enhanceButtonHover(button) {
        button.style.transform = 'translateY(-2px) scale(1.05)';
        button.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
    }

    // 移除按钮悬停
    removeButtonHover(button) {
        button.style.transform = 'translateY(0) scale(1)';
        button.style.boxShadow = '';
    }

    // 显示相关年份
    showRelatedYears(item, index) {
        const currentYear = parseInt(this.timelineData[index].year);
        const relatedItems = this.timelineData
            .map((data, i) => ({ ...data, index: i }))
            .filter(data => {
                const year = parseInt(data.year);
                return Math.abs(year - currentYear) <= 2 && data.index !== index;
            });
        
        if (relatedItems.length > 0) {
            const related = document.createElement('div');
            related.className = 'related-years';
            related.style.cssText = `
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 15px;
                font-size: 0.8rem;
                white-space: nowrap;
                z-index: 15;
                opacity: 0;
                transition: all 0.3s ease;
            `;
            
            related.textContent = `相关年份: ${relatedItems.map(item => item.year).join(', ')}`;
            item.style.position = 'relative';
            item.appendChild(related);
            
            setTimeout(() => {
                related.style.opacity = '1';
            }, 100);
        }
    }

    // 隐藏相关年份
    hideRelatedYears() {
        const related = document.querySelector('.related-years');
        if (related) {
            related.style.opacity = '0';
            setTimeout(() => {
                if (related.parentNode) {
                    related.parentNode.removeChild(related);
                }
            }, 300);
        }
    }

    // 添加全局键盘快捷键
    addGlobalKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key) {
                case 't':
                case 'T':
                    e.preventDefault();
                    this.focusFirstTimelineItem();
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    this.showTimelineHelp();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    this.resetTimelineView();
                    break;
            }
        });
    }

    // 聚焦第一个时间轴项目
    focusFirstTimelineItem() {
        const firstItem = document.querySelector('.timeline-item');
        if (firstItem) {
            firstItem.focus();
            firstItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // 显示时间轴帮助
    showTimelineHelp() {
        const help = document.createElement('div');
        help.className = 'timeline-help';
        help.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        help.innerHTML = `
            <h3 style="margin: 0 0 1rem 0; text-align: center;">时间轴交互指南</h3>
            <div style="line-height: 1.6;">
                <div>🖱️ <strong>鼠标悬停</strong>: 查看预览和相关信息</div>
                <div>🖱️ <strong>点击项目</strong>: 显示快速操作菜单</div>
                <div>⌨️ <strong>方向键</strong>: 在项目间导航</div>
                <div>⌨️ <strong>Enter/空格</strong>: 展开详情</div>
                <div>⌨️ <strong>Esc</strong>: 关闭所有详情</div>
                <div>⌨️ <strong>T</strong>: 跳转到时间轴</div>
                <div>⌨️ <strong>H</strong>: 显示此帮助</div>
                <div>⌨️ <strong>R</strong>: 重置视图</div>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 25px;
                margin-top: 1rem;
                cursor: pointer;
                width: 100%;
            ">知道了</button>
        `;
        
        document.body.appendChild(help);
        
        setTimeout(() => {
            help.style.opacity = '1';
        }, 50);
    }

    // 重置时间轴视图
    resetTimelineView() {
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.classList.remove('highlighted', 'hovered');
            item.style.background = '';
            item.style.border = '';
            item.style.transform = '';
        });
        
        this.hideAllDetails();
        this.hideTimelinePreview();
        
        this.showNotification('时间轴视图已重置');
    }

    // 隐藏所有详情
    hideAllDetails() {
        document.querySelectorAll('.timeline-details').forEach(details => {
            details.style.display = 'none';
        });
        
        document.querySelectorAll('.timeline-toggle').forEach(button => {
            const toggleText = button.querySelector('.toggle-text');
            const toggleIcon = button.querySelector('.toggle-icon');
            if (toggleText) toggleText.textContent = '展开详情';
            if (toggleIcon) toggleIcon.textContent = '▼';
        });
    }

    // 添加时间轴导航
    addTimelineNavigation() {
        const timelineContainer = document.getElementById('timeline-container');
        if (!timelineContainer) return;
        
        const navigation = document.createElement('div');
        navigation.className = 'timeline-navigation';
        navigation.style.cssText = `
            position: sticky;
            top: 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 1rem;
            margin-bottom: 2rem;
            display: flex;
            justify-content: center;
            gap: 1rem;
            z-index: 100;
        `;
        
        navigation.innerHTML = `
            <button class="nav-btn" data-action="prev" title="上一个">⬅️</button>
            <div class="nav-indicator">
                <span class="current-year">${this.timelineData[0].year}</span>
                <span class="year-range">${this.timelineData[this.timelineData.length - 1].year}</span>
            </div>
            <button class="nav-btn" data-action="next" title="下一个">➡️</button>
            <button class="nav-btn" data-action="expand-all" title="展开全部">📖</button>
            <button class="nav-btn" data-action="collapse-all" title="收起全部">📕</button>
        `;
        
        // 添加导航样式
        const style = document.createElement('style');
        style.textContent = `
            .nav-btn {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1rem;
            }
            .nav-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }
            .nav-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: white;
                font-weight: 600;
            }
            .current-year {
                font-size: 1.2rem;
            }
            .year-range {
                font-size: 0.9rem;
                opacity: 0.7;
            }
        `;
        document.head.appendChild(style);
        
        timelineContainer.insertBefore(navigation, timelineContainer.firstChild);
        
        // 添加导航事件
        navigation.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            this.handleNavigationAction(action);
        });
    }

    // 处理导航操作
    handleNavigationAction(action) {
        const items = document.querySelectorAll('.timeline-item');
        const currentHighlighted = document.querySelector('.timeline-item.highlighted');
        let currentIndex = currentHighlighted ? 
            Array.from(items).indexOf(currentHighlighted) : 0;
        
        switch (action) {
            case 'prev':
                currentIndex = Math.max(0, currentIndex - 1);
                this.navigateToItem(items[currentIndex], currentIndex);
                break;
            case 'next':
                currentIndex = Math.min(items.length - 1, currentIndex + 1);
                this.navigateToItem(items[currentIndex], currentIndex);
                break;
            case 'expand-all':
                this.expandAllDetails();
                break;
            case 'collapse-all':
                this.collapseAllDetails();
                break;
        }
    }

    // 导航到指定项目
    navigateToItem(item, index) {
        // 移除其他高亮
        document.querySelectorAll('.timeline-item').forEach(el => {
            el.classList.remove('highlighted');
        });
        
        // 高亮当前项目
        item.classList.add('highlighted');
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        item.focus();
        
        // 更新导航指示器
        const currentYear = document.querySelector('.current-year');
        if (currentYear) {
            currentYear.textContent = this.timelineData[index].year;
        }
    }

    // 展开所有详情
    expandAllDetails() {
        document.querySelectorAll('.timeline-details').forEach(details => {
            details.style.display = 'block';
        });
        
        document.querySelectorAll('.timeline-toggle').forEach(button => {
            const toggleText = button.querySelector('.toggle-text');
            const toggleIcon = button.querySelector('.toggle-icon');
            if (toggleText) toggleText.textContent = '收起详情';
            if (toggleIcon) toggleIcon.textContent = '▲';
        });
        
        this.showNotification('已展开所有详情');
    }

    // 收起所有详情
    collapseAllDetails() {
        this.hideAllDetails();
        this.showNotification('已收起所有详情');
    }

    // 添加时间轴搜索功能
    addTimelineSearch() {
        const timelineContainer = document.getElementById('timeline-container');
        if (!timelineContainer) return;
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'timeline-search';
        searchContainer.style.cssText = `
            position: sticky;
            top: 80px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 1rem;
            margin-bottom: 1rem;
            z-index: 99;
        `;
        
        searchContainer.innerHTML = `
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input type="text" placeholder="搜索时间轴内容..." class="search-input" style="
                    flex: 1;
                    padding: 0.8rem;
                    border: none;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.9);
                    color: #333;
                    font-size: 1rem;
                ">
                <button class="search-btn" style="
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 0.8rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                ">🔍</button>
                <button class="clear-search-btn" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: none;
                    padding: 0.8rem;
                    border-radius: 8px;
                    cursor: pointer;
                ">✕</button>
            </div>
            <div class="search-results" style="
                margin-top: 1rem;
                display: none;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 1rem;
                max-height: 200px;
                overflow-y: auto;
            "></div>
        `;
        
        timelineContainer.insertBefore(searchContainer, timelineContainer.firstChild);
        
        const searchInput = searchContainer.querySelector('.search-input');
        const searchBtn = searchContainer.querySelector('.search-btn');
        const clearBtn = searchContainer.querySelector('.clear-search-btn');
        const resultsContainer = searchContainer.querySelector('.search-results');
        
        // 搜索功能
        const performSearch = () => {
            const query = searchInput.value.toLowerCase().trim();
            if (!query) {
                resultsContainer.style.display = 'none';
                this.clearSearchHighlights();
                return;
            }
            
            const results = this.timelineData.filter((item, index) => {
                return item.title.toLowerCase().includes(query) ||
                       item.description.toLowerCase().includes(query) ||
                       item.details.toLowerCase().includes(query) ||
                       item.year.includes(query);
            });
            
            if (results.length > 0) {
                resultsContainer.innerHTML = results.map((item, i) => `
                    <div class="search-result-item" data-index="${this.timelineData.indexOf(item)}" style="
                        padding: 0.5rem;
                        margin: 0.5rem 0;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 5px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">
                        <div style="font-weight: 600;">${item.year} - ${item.title}</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">${item.description}</div>
                    </div>
                `).join('');
                
                resultsContainer.style.display = 'block';
                this.highlightSearchResults(query);
                
                // 添加结果项点击事件
                resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const index = parseInt(item.dataset.index);
                        const timelineItem = document.querySelector(`[data-index="${index}"]`);
                        if (timelineItem) {
                            timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            this.highlightTimelineItem(timelineItem, index);
                        }
                        resultsContainer.style.display = 'none';
                    });
                });
            } else {
                resultsContainer.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.7);">未找到匹配的结果</div>';
                resultsContainer.style.display = 'block';
            }
        };
        
        searchInput.addEventListener('input', performSearch);
        searchBtn.addEventListener('click', performSearch);
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            resultsContainer.style.display = 'none';
            this.clearSearchHighlights();
        });
        
        // 回车搜索
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // 高亮搜索结果
    highlightSearchResults(query) {
        document.querySelectorAll('.timeline-item').forEach(item => {
            const title = item.querySelector('.timeline-title');
            const description = item.querySelector('.timeline-description');
            
            if (title && title.textContent.toLowerCase().includes(query)) {
                title.style.background = 'rgba(255, 255, 0, 0.3)';
            }
            if (description && description.textContent.toLowerCase().includes(query)) {
                description.style.background = 'rgba(255, 255, 0, 0.3)';
            }
        });
    }

    // 清除搜索高亮
    clearSearchHighlights() {
        document.querySelectorAll('.timeline-title, .timeline-description').forEach(el => {
            el.style.background = '';
        });
    }
}
