// UI效果管理器类
class UIEffectsManager {
    constructor() {
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
        this.cursorState = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            isVisible: false,
            isHovering: false
        };
    }

    // 动态打字机标题
    setupTypingEffect() {
        const titleElement = document.getElementById('typing-title');
        if (!titleElement) return;

        // 为每个文本配置对应的背景色
        this.typingBackgrounds = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
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

    // 自定义光标系统
    setupCustomCursor() {
        // 创建主光标和跟随光标
        this.createCursorElements();
        
        // 绑定事件监听器
        this.bindCursorEvents();
        
        // 启动动画循环
        this.startCursorAnimation();
    }

    // 创建光标元素
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
            transition: all 0.1s ease;
            box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
            border: 2px solid rgba(255, 255, 255, 0.3);
            opacity: 0;
        `;
        
        // 跟随光标
        this.followCursor = document.createElement('div');
        this.followCursor.className = 'custom-cursor-follow';
        this.followCursor.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            transform: translate3d(-50%, -50%, 0);
            transition: all 0.3s ease;
            border: 1px solid rgba(102, 126, 234, 0.2);
            opacity: 0;
        `;
        
        document.body.appendChild(this.mainCursor);
        document.body.appendChild(this.followCursor);
    }

    // 绑定光标事件
    bindCursorEvents() {
        // 使用 passive: true 提高性能
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
        document.addEventListener('mouseenter', this.handleMouseEnter.bind(this), { passive: true });
        document.addEventListener('mouseleave', this.handleMouseLeave.bind(this), { passive: true });
        
        // 悬停效果
        document.addEventListener('mouseover', this.handleMouseOver.bind(this), { passive: true });
        document.addEventListener('mouseout', this.handleMouseOut.bind(this), { passive: true });
    }

    // 处理鼠标移动 - 使用节流优化性能
    handleMouseMove(e) {
        this.cursorState.targetX = e.clientX;
        this.cursorState.targetY = e.clientY;
        
        if (!this.cursorState.isVisible) {
            this.cursorState.isVisible = true;
            this.showCursors();
        }
    }

    // 处理鼠标进入页面
    handleMouseEnter() {
        this.cursorState.isVisible = true;
        this.showCursors();
    }

    // 处理鼠标离开页面
    handleMouseLeave() {
        this.cursorState.isVisible = false;
        this.hideCursors();
    }

    // 处理悬停效果
    handleMouseOver(e) {
        const target = e.target;
        if (this.isInteractiveElement(target)) {
            this.cursorState.isHovering = true;
            this.applyHoverEffect();
        }
    }

    // 处理离开悬停
    handleMouseOut(e) {
        this.cursorState.isHovering = false;
        this.removeHoverEffect();
    }

    // 判断是否为交互元素
    isInteractiveElement(element) {
        return element.tagName === 'A' || 
               element.tagName === 'BUTTON' || 
               element.closest('a') || 
               element.closest('button') ||
               element.classList.contains('interactive') ||
               element.classList.contains('clickable');
    }

    // 显示光标
    showCursors() {
        this.mainCursor.style.opacity = '1';
        this.followCursor.style.opacity = '0.6';
    }

    // 隐藏光标
    hideCursors() {
        this.mainCursor.style.opacity = '0';
        this.followCursor.style.opacity = '0';
    }

    // 应用悬停效果
    applyHoverEffect() {
        this.mainCursor.style.transform = 'translate3d(-50%, -50%, 0) scale(1.5) rotate(180deg)';
        this.mainCursor.style.background = 'linear-gradient(135deg, #f4d03f 0%, #f7dc6f 100%)';
        this.mainCursor.style.boxShadow = '0 0 20px rgba(244, 208, 63, 0.8)';
        this.mainCursor.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        
        this.followCursor.style.transform = 'translate3d(-50%, -50%, 0) scale(1.8)';
        this.followCursor.style.background = 'linear-gradient(135deg, rgba(244, 208, 63, 0.2) 0%, rgba(247, 220, 111, 0.2) 100%)';
    }

    // 移除悬停效果
    removeHoverEffect() {
        this.mainCursor.style.transform = 'translate3d(-50%, -50%, 0) scale(1) rotate(0deg)';
        this.mainCursor.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        this.mainCursor.style.boxShadow = '0 0 10px rgba(102, 126, 234, 0.5)';
        this.mainCursor.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        
        this.followCursor.style.transform = 'translate3d(-50%, -50%, 0) scale(1)';
        this.followCursor.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
    }

    // 启动光标动画循环
    startCursorAnimation() {
        const animate = () => {
            if (this.cursorState.isVisible) {
                // 使用缓动函数实现平滑跟随
                const ease = 0.15;
                this.cursorState.x += (this.cursorState.targetX - this.cursorState.x) * ease;
                this.cursorState.y += (this.cursorState.targetY - this.cursorState.y) * ease;
                
                // 更新光标位置
                this.mainCursor.style.left = this.cursorState.x + 'px';
                this.mainCursor.style.top = this.cursorState.y + 'px';
                
                this.followCursor.style.left = this.cursorState.x + 'px';
                this.followCursor.style.top = this.cursorState.y + 'px';
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // 音乐装饰元素
    setupMusicDecorations() {
        const musicSymbols = ['♪', '♩', '♫', '♬', '𝄞', '𝄢'];
        const hero = document.getElementById('hero');
        
        if (!hero) return;
        
        // 创建装饰元素
        for (let i = 0; i < 8; i++) {
            const decoration = document.createElement('div');
            decoration.className = 'music-decoration';
            decoration.textContent = musicSymbols[Math.floor(Math.random() * musicSymbols.length)];
            decoration.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 20 + 16}px;
                color: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
                pointer-events: none;
                animation: float ${Math.random() * 10 + 5}s ease-in-out infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 5}s;
            `;
            
            hero.appendChild(decoration);
            this.musicDecorations.push(decoration);
        }
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
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // 观察需要动画的元素
        document.querySelectorAll('.card, .feature, .testimonial, .project-card').forEach(el => {
            observer.observe(el);
        });
    }

    // 兴趣爱好展开功能
    setupHobbyExpansion() {
        const hobbyCategories = document.querySelectorAll('.hobby-category');
        
        hobbyCategories.forEach(hobby => {
            hobby.addEventListener('click', () => {
                // 切换展开状态
                const isExpanded = hobby.getAttribute('aria-expanded') === 'true';
                hobby.setAttribute('aria-expanded', !isExpanded);
                
                // 切换内容显示
                const content = hobby.querySelector('.hobby-content');
                if (content) {
                    content.style.maxHeight = isExpanded ? '0' : content.scrollHeight + 'px';
                }
                
                // 添加展开提示
                if (isExpanded) {
                    this.showExpansionHint(hobby);
                }
            });
            
            // 设置初始aria属性
            hobby.setAttribute('aria-expanded', 'false');
        });
    }

    // 显示展开提示
    showExpansionHint(hobby) {
        const hint = document.createElement('div');
        hint.className = 'expansion-hint';
        hint.textContent = '点击收起';
        hint.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        hobby.style.position = 'relative';
        hobby.appendChild(hint);
        
        setTimeout(() => hint.remove(), 2000);
    }

    // 高性能粒子背景效果
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
            z-index: -1;
            opacity: 0.6;
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
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
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

    // 检测设备性能
    isDeviceCapable() {
        // 检测是否为低性能设备
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return gl && gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) > 0;
    }

    // 调整画布大小
    resizeCanvas() {
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
    }

    // 启动粒子动画
    startParticleAnimation() {
        const animate = () => {
            this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
            
            this.particles.forEach(particle => {
                // 更新位置
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // 边界检测
                if (particle.x < 0 || particle.x > this.particleCanvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > this.particleCanvas.height) particle.vy *= -1;
                
                // 绘制粒子
                this.particleCtx.beginPath();
                this.particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.particleCtx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`;
                this.particleCtx.fill();
            });
            
            this.particleAnimationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    // 防抖函数
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

    // 页面过渡效果
    setupPageTransitions() {
        // 为所有内部链接添加过渡效果
        document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.triggerPageTransition(href);
            });
        });
    }

    // 触发页面过渡
    triggerPageTransition(targetUrl) {
        const body = document.body;
        
        // 添加淡出效果
        body.style.transition = 'opacity 0.3s ease';
        body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 300);
    }

    // 导航高亮
    setupNavigationHighlight() {
        const navLinks = document.querySelectorAll('nav a');
        const sections = document.querySelectorAll('section[id]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => observer.observe(section));
    }

    // 加载进度
    setupLoadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'loading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            z-index: 10000;
            transition: width 0.3s ease;
        `;
        
        document.body.appendChild(progressBar);
        
        // 模拟加载进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => progressBar.remove(), 500);
            }
            progressBar.style.width = progress + '%';
        }, 100);
    }

    // 按钮效果
    setupButtonEffects() {
        const buttons = document.querySelectorAll('button, .btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '';
            });
        });
    }

    // 支付效果
    setupPaymentEffects() {
        const paymentButtons = document.querySelectorAll('.payment-btn');
        
        paymentButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPaymentSuccess();
            });
        });
    }

    // 显示支付成功
    showPaymentSuccess() {
        const modal = document.createElement('div');
        modal.className = 'payment-success-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 12px;
                text-align: center;
                max-width: 400px;
                animation: scaleIn 0.3s ease;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                <h2 style="color: #2ecc71; margin-bottom: 16px;">支付成功！</h2>
                <p style="color: #666; margin-bottom: 24px;">感谢您的支持，我们会尽快处理您的订单。</p>
                <button onclick="this.closest('.payment-success-modal').remove()" style="
                    background: #2ecc71;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                ">确定</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 添加CSS动画
        if (!document.getElementById('payment-modal-style')) {
            const style = document.createElement('style');
            style.id = 'payment-modal-style';
            style.textContent = `
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 添加滚动视差效果
    setupParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-element');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // 添加鼠标跟随粒子效果
    setupMouseParticles() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const particles = [];
        
        // 设置画布大小
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // 粒子类
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
                this.life = 1;
                this.decay = Math.random() * 0.02 + 0.01;
                this.size = Math.random() * 3 + 1;
                this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;
                this.vy += 0.01; // 重力效果
            }
            
            draw() {
                ctx.save();
                ctx.globalAlpha = this.life;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        
        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            if (Math.random() < 0.3) { // 30%概率创建粒子
                particles.push(new Particle(e.clientX, e.clientY));
            }
        });
        
        // 动画循环
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                particle.update();
                particle.draw();
                
                if (particle.life <= 0) {
                    particles.splice(i, 1);
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }

    // 添加页面切换动画
    setupPageTransitions() {
        // 为所有内部链接添加切换动画
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.hostname === window.location.hostname) {
                e.preventDefault();
                
                // 创建切换遮罩
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    z-index: 9999;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                document.body.appendChild(overlay);
                
                // 显示遮罩
                setTimeout(() => {
                    overlay.style.opacity = '1';
                }, 10);
                
                // 跳转页面
                setTimeout(() => {
                    window.location.href = link.href;
                }, 300);
            }
        });
    }

    // 添加元素进入视口动画
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // 观察需要动画的元素
        const animatedElements = document.querySelectorAll('.project-card, .hobby-category, .performance-item, .timeline-item');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
        
        // 添加CSS动画类
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
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

    // 清理资源
    cleanup() {
        // 清理光标元素
        if (this.mainCursor) this.mainCursor.remove();
        if (this.followCursor) this.followCursor.remove();
        
        // 清理粒子动画
        if (this.particleAnimationId) {
            cancelAnimationFrame(this.particleAnimationId);
        }
        if (this.particleCanvas) {
            this.particleCanvas.remove();
        }
        
        // 清理音乐装饰
        this.musicDecorations.forEach(decoration => decoration.remove());
        
        // 清理窗口事件监听器
        if (this.debouncedResize) {
            window.removeEventListener('resize', this.debouncedResize);
        }
    }
}
