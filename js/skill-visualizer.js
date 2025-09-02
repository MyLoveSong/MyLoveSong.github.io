// 技能可视化类
class SkillVisualizer {
    constructor() {
        this.skills = [
            { name: 'JavaScript', level: 90, color: '#f7df1e' },
            { name: 'HTML/CSS', level: 95, color: '#e34f26' },
            { name: 'React', level: 85, color: '#61dafb' },
            { name: 'Node.js', level: 80, color: '#339933' },
            { name: 'Python', level: 75, color: '#3776ab' },
            { name: 'Git', level: 88, color: '#f05032' }
        ];
        this.observer = null;
    }

    // 初始化技能条
    initSkillBars() {
        const skillsContainer = document.getElementById('skills-container');
        if (!skillsContainer) {
            console.warn('技能容器未找到');
            return;
        }
        
        console.log('初始化技能条，技能数据:', this.skills);

        skillsContainer.innerHTML = this.skills.map(skill => `
            <div class="skill-item" data-skill="${skill.name}" style="
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                border-radius: 15px;
                border: 1px solid rgba(255,255,255,0.2);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            ">
                <div class="skill-info" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.8rem;
                    position: relative;
                    z-index: 2;
                ">
                    <span class="skill-name" style="
                        font-weight: 600;
                        font-size: 1.1rem;
                        color: #ffffff;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">${skill.name}</span>
                    <span class="skill-percentage" style="
                        font-weight: 700;
                        font-size: 1.2rem;
                        color: ${skill.color};
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        background: linear-gradient(45deg, ${skill.color}, #ffffff);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    ">${skill.level.toFixed(0)}%</span>
                </div>
                <div class="skill-bar" style="
                    height: 12px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                    overflow: hidden;
                    position: relative;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
                ">
                    <div class="skill-progress" 
                         style="
                            height: 100%;
                            width: 0%;
                            background: linear-gradient(90deg, ${skill.color}, ${skill.color}dd, ${skill.color}aa);
                            border-radius: 10px;
                            position: relative;
                            transition: width 2s cubic-bezier(0.4, 0, 0.2, 1);
                            box-shadow: 0 0 20px ${skill.color}66, 0 0 40px ${skill.color}33;
                        "
                         data-level="${skill.level}">
                        <div class="progress-shine" style="
                            position: absolute;
                            top: 0;
                            left: -100%;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
                            animation: shine 2s infinite;
                        "></div>
                    </div>
                </div>
                <div class="skill-glow" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle at 50% 50%, ${skill.color}22, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                "></div>
            </div>
        `).join('');

        this.observeSkillBars();
        this.addSkillAnimations();
    }

    // 观察技能条进入视口
    observeSkillBars() {
        if (!('IntersectionObserver' in window)) {
            // 降级处理
            this.animateSkillBars();
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSkillBars();
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const skillsContainer = document.getElementById('skills-container');
        if (skillsContainer) {
            this.observer.observe(skillsContainer);
        }
    }

    // 动画技能条
    animateSkillBars() {
        const progressBars = document.querySelectorAll('.skill-progress');
        progressBars.forEach((bar, index) => {
            const level = parseInt(bar.dataset.level);
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
                bar.style.width = `${level}%`;
            }, 100 + index * 200); // 错开动画时间
        });
    }

    // 添加技能条动画和交互效果
    addSkillAnimations() {
        // 添加CSS动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shine {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 20px currentColor; }
                50% { box-shadow: 0 0 30px currentColor, 0 0 40px currentColor; }
            }
            
            .skill-item:hover {
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            
            .skill-item:hover .skill-glow {
                opacity: 1;
            }
            
            .skill-item:hover .skill-progress {
                animation: pulse 1s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);

        // 添加悬停效果
        const skillItems = document.querySelectorAll('.skill-item');
        skillItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-5px) scale(1.02)';
                item.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                const glow = item.querySelector('.skill-glow');
                if (glow) glow.style.opacity = '1';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0) scale(1)';
                item.style.boxShadow = 'none';
                const glow = item.querySelector('.skill-glow');
                if (glow) glow.style.opacity = '0';
            });
        });
    }

    // 初始化雷达图
    initRadarChart() {
        const radarContainer = document.getElementById('radar-chart');
        if (!radarContainer) {
            console.warn('雷达图容器未找到');
            return;
        }

        // 优先使用 Chart.js；若不可用，降级到内置 Canvas 绘制
        if (typeof Chart !== 'undefined') {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            radarContainer.appendChild(canvas);

            try {
                const isDarkTheme = document.body.classList.contains('dark-theme');
                const textColor = isDarkTheme ? '#333' : '#ffffff';
                const gridColor = isDarkTheme ? '#e0e0e0' : 'rgba(255, 255, 255, 0.3)';
                
                // 创建渐变背景
                const ctx = canvas.getContext('2d');
                const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
                gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
                gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');
                
                new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: this.skills.map(s => s.name),
                        datasets: [{
                            label: '技能水平',
                            data: this.skills.map(s => Number(s.level)),
                            backgroundColor: 'rgba(102, 126, 234, 0.3)',
                            borderColor: 'rgba(102, 126, 234, 1)',
                            borderWidth: 3,
                            pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 3,
                            pointRadius: 8,
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
                            pointHoverRadius: 10,
                            pointHoverBorderWidth: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 2000,
                            easing: 'easeInOutQuart'
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: textColor,
                                    font: {
                                        size: 14,
                                        weight: 'bold'
                                    },
                                    padding: 20
                                }
                            }
                        },
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: 100,
                                min: 0,
                                ticks: {
                                    stepSize: 20,
                                    color: textColor,
                                    font: {
                                        size: 12,
                                        weight: 'bold'
                                    },
                                    backdropColor: 'rgba(0, 0, 0, 0.1)',
                                    backdropPadding: 4
                                },
                                grid: {
                                    color: gridColor,
                                    lineWidth: 2
                                },
                                pointLabels: {
                                    color: textColor,
                                    font: {
                                        size: 13,
                                        weight: 'bold'
                                    },
                                    padding: 15
                                },
                                angleLines: {
                                    color: gridColor,
                                    lineWidth: 2
                                }
                            }
                        },
                        elements: {
                            line: {
                                tension: 0.1
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Chart.js 初始化失败:', error);
                // Fallback: 内置 Canvas
                this.drawRadarChart(radarContainer);
            }
        } else {
            console.log('Chart.js 不可用，使用内置 Canvas 绘制');
            // Fallback: 内置 Canvas
            this.drawRadarChart(radarContainer);
        }
    }

    // 绘制雷达图（Canvas 降级方案）
    drawRadarChart(container) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        const labels = this.skills.map(s => s.name);
        const data = this.skills.map(s => Number(s.level)); // 确保数据是数字类型

        // 根据主题调整颜色
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const gridColor = isDarkTheme ? '#e0e0e0' : 'rgba(255, 255, 255, 0.3)';
        const textColor = isDarkTheme ? '#333' : '#ffffff';
        
        // 绘制网格
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius * i) / 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 绘制轴线
        for (let i = 0; i < labels.length; i++) {
            const angle = (i * Math.PI * 2) / labels.length - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // 绘制标签
            ctx.fillStyle = textColor;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], x, y + 5);
        }

        // 绘制数据 - 美化版本
        // 创建渐变
        const dataGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        dataGradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
        dataGradient.addColorStop(1, 'rgba(102, 126, 234, 0.1)');
        
        ctx.fillStyle = dataGradient;
        ctx.strokeStyle = 'rgba(102, 126, 234, 1)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(102, 126, 234, 0.5)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const angle = (i * Math.PI * 2) / data.length - Math.PI / 2;
            const value = (data[i] / 100) * radius;
            const x = centerX + Math.cos(angle) * value;
            const y = centerY + Math.sin(angle) * value;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 绘制数据点
        ctx.shadowBlur = 0;
        for (let i = 0; i < data.length; i++) {
            const angle = (i * Math.PI * 2) / data.length - Math.PI / 2;
            const value = (data[i] / 100) * radius;
            const x = centerX + Math.cos(angle) * value;
            const y = centerY + Math.sin(angle) * value;
            
            // 外圈白色
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // 内圈蓝色
            ctx.fillStyle = 'rgba(102, 126, 234, 1)';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
