// 兴趣爱好和音乐表演酷炫效果管理器
class HobbyPerformanceEffects {
    constructor() {
        this.isInitialized = false;
        this.intersectionObserver = null;
        this.animationQueue = [];
        this.currentAnimation = null;
    }

    // 初始化
    init() {
        if (this.isInitialized) return;
        
        console.log('🎭 初始化兴趣爱好和音乐表演酷炫效果...');
        
        this.setupIntersectionObserver();
        this.setupEventListeners();
        this.initializeAnimations();
        
        this.isInitialized = true;
        console.log('✅ 兴趣爱好和音乐表演酷炫效果已初始化');
    }

    // 设置交叉观察器
    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // 观察所有需要动画的元素
        const animatedElements = document.querySelectorAll(
            '.hobby-category, .performance-item, .skill-bar, .stat-card'
        );
        
        animatedElements.forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        // 兴趣爱好标签点击效果
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('hobby-tag')) {
                this.animateTagClick(e.target);
            }
        });

        // 技能进度条动画
        document.addEventListener('scroll', () => {
            this.checkSkillBarsVisibility();
        });

        // 统计数字动画
        document.addEventListener('scroll', () => {
            this.checkStatsVisibility();
        });

        // 鼠标移动粒子效果
        document.addEventListener('mousemove', (e) => {
            this.createMouseParticles(e);
        });
    }

    // 初始化动画
    initializeAnimations() {
        // 初始化技能进度条
        this.initializeSkillBars();
        
        // 初始化统计数字
        this.initializeStats();
        
        // 初始化粒子系统
        this.initializeParticleSystem();
    }

    // 元素进入视口时的动画
    animateElement(element) {
        if (element.classList.contains('animated')) return;
        
        element.classList.add('animated');
        
        // 根据元素类型选择不同的动画
        if (element.classList.contains('hobby-category')) {
            this.animateHobbyCategory(element);
        } else if (element.classList.contains('performance-item')) {
            this.animatePerformanceItem(element);
        } else if (element.classList.contains('skill-bar')) {
            this.animateSkillBar(element);
        } else if (element.classList.contains('stat-card')) {
            this.animateStatCard(element);
        }
    }

    // 兴趣爱好类别动画
    animateHobbyCategory(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px) scale(0.9)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
            
            // 图标动画
            const icon = element.querySelector('.hobby-icon');
            if (icon) {
                icon.style.animation = 'iconFloat 3s ease-in-out infinite';
            }
            
            // 标签动画
            const tags = element.querySelectorAll('.hobby-tag');
            tags.forEach((tag, index) => {
                setTimeout(() => {
                    tag.style.opacity = '0';
                    tag.style.transform = 'translateX(-20px)';
                    tag.style.transition = 'all 0.4s ease';
                    
                    setTimeout(() => {
                        tag.style.opacity = '1';
                        tag.style.transform = 'translateX(0)';
                    }, 100);
                }, index * 100);
            });
        }, 100);
    }

    // 表演项目动画
    animatePerformanceItem(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(-30px) rotateY(-15deg)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateX(0) rotateY(0)';
            
            // 图标动画
            const icon = element.querySelector('.performance-icon');
            if (icon) {
                icon.style.animation = 'performanceIconPulse 2s ease-in-out infinite';
            }
            
            // 内容动画
            const content = element.querySelector('.performance-content');
            if (content) {
                content.style.opacity = '0';
                content.style.transform = 'translateY(20px)';
                content.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                }, 300);
            }
        }, 200);
    }

    // 技能进度条动画
    animateSkillBar(element) {
        const progressFill = element.querySelector('.skill-progress-fill');
        const percentage = element.querySelector('.skill-percentage');
        
        if (!progressFill || !percentage) return;
        
        const targetLevel = progressFill.dataset.level;
        const currentLevel = parseInt(targetLevel);
        
        // 重置进度条
        progressFill.style.width = '0%';
        percentage.textContent = '0%';
        
        // 动画进度条
        let currentProgress = 0;
        const increment = currentLevel / 100;
        
        const animateProgress = () => {
            if (currentProgress < currentLevel) {
                currentProgress += increment;
                progressFill.style.width = `${currentProgress}%`;
                percentage.textContent = `${Math.round(currentProgress)}%`;
                requestAnimationFrame(animateProgress);
            } else {
                progressFill.style.width = `${currentLevel}%`;
                percentage.textContent = `${currentLevel}%`;
            }
        };
        
        animateProgress();
    }

    // 统计卡片动画
    animateStatCard(element) {
        const statNumber = element.querySelector('.stat-number');
        if (!statNumber) return;
        
        const targetNumber = parseInt(statNumber.dataset.target);
        let currentNumber = 0;
        const increment = targetNumber / 50;
        
        const animateNumber = () => {
            if (currentNumber < targetNumber) {
                currentNumber += increment;
                statNumber.textContent = Math.round(currentNumber);
                requestAnimationFrame(animateNumber);
            } else {
                statNumber.textContent = targetNumber;
            }
        };
        
        animateNumber();
    }

    // 兴趣爱好标签点击动画
    animateTagClick(tag) {
        // 创建涟漪效果
        const ripple = document.createElement('div');
        ripple.className = 'tag-ripple';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(244, 208, 63, 0.6);
            transform: scale(0);
            animation: tagRipple 0.6s linear;
            pointer-events: none;
        `;
        
        const rect = tag.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = rect.left + rect.width / 2 - size / 2;
        const y = rect.top + rect.height / 2 - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        document.body.appendChild(ripple);
        
        // 标签弹跳效果
        tag.style.transform = 'scale(1.1)';
        tag.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            tag.style.transform = 'scale(1)';
        }, 200);
        
        // 清理涟漪元素
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 600);
    }

    // 检查技能进度条可见性
    checkSkillBarsVisibility() {
        const skillBars = document.querySelectorAll('.skill-bar');
        skillBars.forEach(bar => {
            const rect = bar.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !bar.classList.contains('animated')) {
                this.animateSkillBar(bar);
            }
        });
    }

    // 检查统计卡片可见性
    checkStatsVisibility() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !card.classList.contains('animated')) {
                this.animateStatCard(card);
            }
        });
    }

    // 初始化技能进度条
    initializeSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar');
        skillBars.forEach(bar => {
            const progressFill = bar.querySelector('.skill-progress-fill');
            if (progressFill) {
                progressFill.style.width = '0%';
            }
        });
    }

    // 初始化统计数字
    initializeStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            stat.textContent = '0';
        });
    }

    // 初始化粒子系统
    initializeParticleSystem() {
        // 为兴趣爱好区域添加更多粒子
        this.addHobbyParticles();
        
        // 为表演区域添加音符粒子
        this.addPerformanceParticles();
    }

    // 添加兴趣爱好粒子
    addHobbyParticles() {
        const hobbySection = document.querySelector('#hobbies');
        if (!hobbySection) return;
        
        const particleContainer = hobbySection.querySelector('.hobby-particles');
        if (!particleContainer) return;
        
        // 添加更多粒子
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 6 + 2}px;
                height: ${Math.random() * 6 + 2}px;
                background: linear-gradient(45deg, #f4d03f, #f7dc6f);
                border-radius: 50%;
                opacity: ${Math.random() * 0.4 + 0.2};
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 4 + 6}s ease-in-out infinite;
                animation-delay: ${Math.random() * 4}s;
            `;
            
            particleContainer.appendChild(particle);
        }
    }

    // 添加表演区域音符粒子
    addPerformanceParticles() {
        const performanceSection = document.querySelector('#performances');
        if (!performanceSection) return;
        
        const notesContainer = performanceSection.querySelector('.music-notes-bg');
        if (!notesContainer) return;
        
        // 添加更多音符
        const notes = ['♪', '♫', '♬', '♩', '♭', '♯', '♮', '𝄞', '𝄡', '𝄢'];
        
        for (let i = 0; i < 15; i++) {
            const note = document.createElement('div');
            note.className = 'music-note';
            note.textContent = notes[Math.floor(Math.random() * notes.length)];
            note.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 2 + 1.5}rem;
                color: rgba(244, 208, 63, ${Math.random() * 0.4 + 0.2});
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: musicNoteFloat ${Math.random() * 3 + 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 4}s;
            `;
            
            notesContainer.appendChild(note);
        }
    }

    // 创建鼠标移动粒子效果
    createMouseParticles(e) {
        // 限制粒子创建频率
        if (this.lastParticleTime && Date.now() - this.lastParticleTime < 50) return;
        this.lastParticleTime = Date.now();
        
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            pointer-events: none;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, #f4d03f, #f7dc6f);
            border-radius: 50%;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            z-index: 10000;
            animation: mouseParticle 1s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        // 清理粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }

    // 销毁
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        this.isInitialized = false;
        console.log('🗑️ 兴趣爱好和音乐表演酷炫效果已销毁');
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes tagRipple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes mouseParticle {
        0% {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
        100% {
            transform: scale(0) translateY(-20px);
            opacity: 0;
        }
    }
    
    .hobby-category, .performance-item, .skill-bar, .stat-card {
        opacity: 0;
        transform: translateY(30px);
    }
    
    .hobby-category.animated, .performance-item.animated, .skill-bar.animated, .stat-card.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    .tag-ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(244, 208, 63, 0.6);
        transform: scale(0);
        animation: tagRipple 0.6s linear;
        pointer-events: none;
    }
`;

document.head.appendChild(style);

// 全局实例
window.hobbyPerformanceEffects = new HobbyPerformanceEffects();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.hobbyPerformanceEffects.init();
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HobbyPerformanceEffects;
}
