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
        this.beatPattern = null; // 存储当前轨道的节拍模式
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
                const selectedTrack = this.musicTracks[this.currentTrack];
                this.bpm = selectedTrack.bpm;
                this.beatInterval = 60000 / this.bpm;
                this.beatPattern = selectedTrack.notes; // 保存节拍模式，不覆盖beatNotes数组
                
                // 高亮选中的轨道
                document.querySelectorAll('.track-btn').forEach(btn => {
                    btn.style.opacity = '0.6';
                    btn.style.transform = 'scale(1)';
                });
                e.target.style.opacity = '1';
                e.target.style.transform = 'scale(1.1)';
                
                console.log(`已选择音乐轨道: ${selectedTrack.name} (${selectedTrack.bpm} BPM)`);
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
        
        // 重要：初始化beatNotes为空数组，用于存储音符对象
        this.beatNotes = [];
        
        // 获取当前轨道的节拍模式
        const currentTrack = this.musicTracks[this.currentTrack];
        this.bpm = currentTrack.bpm;
        this.beatInterval = 60000 / this.bpm;
        this.beatPattern = currentTrack.notes; // 保存节拍模式
        
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
            // 使用beatPattern而不是beatNotes来检查是否应该生成音符
            if (this.beatPattern && this.beatPattern[this.beatIndex % this.beatPattern.length] === 1) {
                // 随机生成音符的x坐标，让方块从上方各个方位落下
                const minX = 50; // 左边距
                const maxX = this.canvas.width - 50; // 右边距
                const randomX = Math.random() * (maxX - minX) + minX;
                
                this.beatNotes.push({
                    x: randomX,
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
        
        // 清理音频上下文
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    // 增加难度
    increaseDifficulty() {
        // 增加音符速度
        this.newNoteSpeed += 0.2;
        
        // 减少节拍间隔（增加BPM）
        this.beatInterval = Math.max(200, this.beatInterval - 10);
    }

    // 添加屏幕震动效果
    addScreenShake(intensity = 5) {
        const gameContainer = this.gameContainer;
        if (!gameContainer) return;
        
        const originalTransform = gameContainer.style.transform;
        const shakeX = (Math.random() - 0.5) * intensity;
        const shakeY = (Math.random() - 0.5) * intensity;
        
        gameContainer.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        
        setTimeout(() => {
            gameContainer.style.transform = originalTransform;
        }, 100);
    }

    // 添加连击特效
    addComboEffect() {
        // 每10连击触发特殊效果
        if (this.combo > 0 && this.combo % 10 === 0) {
            this.addScreenShake(8);
            
            // 创建连击粒子爆发
            for (let i = 0; i < 30; i++) {
                this.particles.push({
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2,
                    vx: (Math.random() - 0.5) * 20,
                    vy: (Math.random() - 0.5) * 20,
                    size: Math.random() * 5 + 3,
                    color: '#f4d03f',
                    life: 80,
                    maxLife: 80,
                    alpha: 1
                });
            }
            
            this.showHitText(this.canvas.width / 2, this.canvas.height / 2, `${this.combo} COMBO!`, '#f4d03f');
        }
    }
}
