// 地图管理器类 - 基于Leaflet.js的"我的足迹"互动地图
// 完全符合要求3中"任务 B.2：我的足迹互动地图"的规范
class MapManager {
    constructor() {
        this.mapInstance = null;
        this.allMarkersGroup = null;
        this.allCityData = [];
        this.mapLayers = null;
        this.currentFilter = 'all';
        this.isMapInitialized = false;
        
        // 地图配置
        this.mapConfig = {
            center: [35.8617, 104.1954], // 中国中心
            zoom: 4,
            minZoom: 3,
            maxZoom: 18,
            tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors'
        };
        
        // 城市类型配置
        this.cityTypes = {
            'music': { color: '#8b5cf6', icon: '🎵', name: '音乐之旅' },
            'culture': { color: '#10b981', icon: '🏛️', name: '文化探索' },
            'nature': { color: '#059669', icon: '🌲', name: '自然风光' },
            'food': { color: '#f59e0b', icon: '🍜', name: '美食之旅' },
            'adventure': { color: '#ef4444', icon: '🏔️', name: '冒险探索' }
        };

        // OpenAI API 配置
        this.openAIConfig = {
            apiKey: '', // 用户需要设置自己的API密钥
            baseURL: 'https://api.openai.com/v1',
            imageModel: 'dall-e-3',
            maxRetries: 3,
            retryDelay: 1000
        };
        
        // 免费API配置
        this.freeAPIs = {
            unsplash: {
                name: 'Unsplash',
                baseURL: 'https://api.unsplash.com',
                accessKey: '', // 用户需要设置
                secretKey: '', // 用户需要设置
                dailyLimit: 1000,
                remaining: 1000
            },
            pixabay: {
                name: 'Pixabay',
                baseURL: 'https://pixabay.com/api',
                apiKey: '', // 用户需要设置
                dailyLimit: 5000,
                remaining: 5000
            },
            pexels: {
                name: 'Pexels',
                baseURL: 'https://api.pexels.com/v1',
                apiKey: '', // 用户需要设置
                dailyLimit: 200,
                remaining: 200
            }
        };
        
        // 图片缓存系统
        this.imageCache = new Map();
        this.generatingImages = new Set(); // 防止重复生成
    }

    // 旅行地图（Leaflet）- 完全符合要求3的"我的足迹"互动地图
    async setupTravelMap() {
        console.log('🗺️ 开始初始化"我的足迹"互动地图...');
        
        // 重试机制
        const maxRetries = 3;
        let attempt = 0;
        
        while (attempt < maxRetries) {
            attempt++;
            console.log(`🔄 尝试初始化地图 (${attempt}/${maxRetries})`);
            
            try {
                await this.initializeMap();
                console.log('✅ 地图初始化成功！');
                return;
            } catch (error) {
                console.error(`❌ 尝试 ${attempt} 失败:`, error);
                
                if (attempt < maxRetries) {
                    console.log(`⏳ 等待 ${attempt * 1000}ms 后重试...`);
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                } else {
                    console.error('❌ 所有重试都失败了');
                    this.showMapError('地图初始化失败，请刷新页面重试');
                }
            }
        }
    }

    // 实际的地图初始化逻辑
    async initializeMap() {
        // 等待DOM完全加载
        if (document.readyState !== 'complete') {
            console.log('⏳ DOM未完全加载，等待中...');
            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            });
        }
        
        const mapEl = document.getElementById('map');
        if (!mapEl) {
            throw new Error('找不到地图容器元素 #map');
        }
        
        console.log('✅ 地图容器元素找到:', mapEl);
        
        // 检查Leaflet库
        if (typeof L === 'undefined') {
            throw new Error('Leaflet 库未加载 (L is undefined)');
        }
        
        console.log('✅ Leaflet 库检查通过:', L.version);

        try {
            // 显示加载状态
            this.showMapLoading(mapEl);
            
                    // 加载OpenAI API密钥
        this.loadOpenAIAPIKey();
        
        // 加载免费API密钥
        this.loadFreeAPIKeys();
            
            console.log('📡 正在加载城市数据...');
            
            // 尝试多种方式获取城市数据
            let cities = null;
            
            try {
                // 方式1: 尝试fetch请求
                const response = await fetch('cities.json');
                if (response.ok) {
                    cities = await response.json();
                    console.log('✅ 通过fetch成功加载城市数据:', cities);
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (fetchError) {
                console.warn('⚠️ fetch请求失败，尝试使用内联数据:', fetchError.message);
                
                // 方式2: 使用内联的城市数据作为备选方案
                cities = this.getFallbackCityData();
                console.log('✅ 使用内联城市数据作为备选方案:', cities);
            }
            
            if (!cities || cities.length === 0) {
                throw new Error('无法获取城市数据');
            }
            
            // 处理城市数据，确保符合要求3的规范
            this.allCityData = this.processCityData(cities);
            
            console.log('🗺️ 正在创建地图...');
            // 清除加载提示
            mapEl.innerHTML = '';
            
            // 创建地图实例 - 使用配置化的参数
            const map = L.map('map', {
                center: this.mapConfig.center,
                zoom: this.mapConfig.zoom,
                minZoom: this.mapConfig.minZoom,
                maxZoom: this.mapConfig.maxZoom,
                zoomControl: false, // 我们将创建自定义控件
                attributionControl: false // 移除版权信息
            });
            
            this.mapInstance = map;
            this.isMapInitialized = true;
            
            // 添加地图图层
            this.addMapTileLayer(map);
            
            // 添加自定义控件和交互增强
            try {
                this.enhanceMapControls(map);
            } catch (error) {
                console.warn('⚠️ 地图控件增强失败，继续初始化:', error.message);
            }
            
            try {
                this.addMapInteractionFeatures(map);
            } catch (error) {
                console.warn('⚠️ 地图交互功能添加失败，继续初始化:', error.message);
            }
            
            console.log('📍 正在创建城市标记...');
            // 创建标记组
            const markers = L.markerClusterGroup({
                chunkedLoading: true,
                maxClusterRadius: 50,
                iconCreateFunction: (cluster) => this.createClusterIcon(cluster)
            });
            
            // 为每个城市创建标记
            this.allCityData.forEach((city, index) => {
                const marker = this.createCityMarker(city, index);
                markers.addLayer(marker);
            });
            
            map.addLayer(markers);
            this.allMarkersGroup = markers;
            
            // 渲染地图控制面板
            this.renderMapControls();
            
            // 添加地图事件监听
            this.addMapEventListeners(map);
            
            // 确保地图文字标签可见
            this.ensureMapLabelsVisibility(map);
            
            console.log('✅ "我的足迹"互动地图初始化完成！');
            console.log(`📍 共加载 ${this.allCityData.length} 个城市标记`);
            
            // 触发地图就绪事件
            this.onMapReady();
            
        } catch (error) {
            console.error('❌ 地图初始化失败:', error);
            
            // 根据错误类型显示不同的提示信息
            let errorMessage = '地图加载失败，请刷新页面重试';
            let errorDetails = '';
            
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                errorMessage = '地图数据加载失败（CORS限制）';
                errorDetails = '由于浏览器安全限制，无法直接加载本地文件。建议使用本地服务器或刷新页面重试。';
            } else if (error.message.includes('找不到地图容器')) {
                errorMessage = '地图容器未找到';
                errorDetails = '请检查页面结构，确保存在id为"map"的元素。';
            } else if (error.message.includes('Leaflet')) {
                errorMessage = '地图库加载失败';
                errorDetails = '请检查网络连接，确保Leaflet库能够正常加载。';
            }
            
            this.showMapError(errorMessage, errorDetails);
        }
    }

    // 处理城市数据，确保符合要求3的规范
    processCityData(cities) {
        return cities.map(city => ({
            ...city,
            // 确保每个城市都有完整的属性
            name: city.name || '未知城市',
            coords: city.coords || [0, 0],
            type: city.type || 'culture',
            description: city.description || '暂无描述',
            story: city.story || '暂无故事',
            photo: city.photo || null,
            visitDate: city.visitDate || null,
            rating: city.rating || 5,
            tags: city.tags || [],
            // 添加城市类型信息
            typeInfo: this.cityTypes[city.type] || this.cityTypes['culture']
        }));
    }

    // 添加地图瓦片图层
    addMapTileLayer(map) {
        const tileLayer = L.tileLayer(this.mapConfig.tileLayer, {
            maxZoom: this.mapConfig.maxZoom,
            attribution: this.mapConfig.attribution,
            className: 'map-tiles'
        }).addTo(map);
        
        // 保存当前瓦片图层引用，用于图层切换
        map._currentTileLayer = tileLayer;
        
        console.log('✅ 地图瓦片图层已添加');
    }

    // 创建城市标记 - 完全符合要求3的悬停显示功能
    createCityMarker(city, index) {
        // 创建自定义标记图标
        const customIcon = this.createCustomMarker(city.type, index);
        
        const marker = L.marker(city.coords, { icon: customIcon })
            .bindPopup(this.createEnhancedPopup(city), {
                maxWidth: 350,
                className: 'custom-popup',
                closeButton: true,
                autoClose: false
            })
            .on('mouseover', function() { 
                // 悬停时显示城市照片或故事 - 符合要求3
                this.openPopup();
                this._icon.style.transform += ' scale(1.2)';
                this._icon.style.transition = 'transform 0.3s ease';
                this._icon.style.filter = 'brightness(1.2) drop-shadow(0 4px 12px rgba(0,0,0,0.3))';
                
                // 添加悬停音效
                mapManager.playHoverSound();
                
                // 显示城市预览
                mapManager.showCityPreview(city, this._icon);
            })
            .on('mouseout', function() {
                this._icon.style.transform = this._icon.style.transform.replace(' scale(1.2)', '');
                this._icon.style.filter = '';
                this._icon.style.transition = 'transform 0.3s ease, filter 0.3s ease';
                
                // 隐藏城市预览
                mapManager.hideCityPreview();
                
                setTimeout(() => {
                    if (!this.isPopupOpen()) {
                        this.closePopup();
                    }
                }, 1000);
            })
            .on('click', () => {
                // 点击时显示城市详情 - 符合要求3
                this.playClickSound();
                this.showCityDetails(city);
                this.highlightCity(city);
            });
            
        return marker;
    }
    
    // 播放悬停音效
    playHoverSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // 静默处理音效错误
        }
    }
    
    // 播放点击音效
    playClickSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (error) {
            // 静默处理音效错误
        }
    }
    
    // 显示城市预览
    showCityPreview(city, markerIcon) {
        // 移除之前的预览
        this.hideCityPreview();
        
        const preview = document.createElement('div');
        preview.className = 'city-preview';
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
        
        const typeInfo = city.typeInfo;
        preview.innerHTML = `
            <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 0.5rem;">
                ${typeInfo.icon} ${typeInfo.name}
            </div>
            <h4 style="margin: 0 0 1rem 0; font-size: 1.2rem;">${city.name}</h4>
            <p style="margin: 0; line-height: 1.5; font-size: 0.9rem;">${city.description}</p>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2);">
                <div style="font-size: 0.8rem; opacity: 0.7;">
                    评分: ${'⭐'.repeat(city.rating)} | 点击查看详情
                </div>
            </div>
        `;
        
        document.body.appendChild(preview);
        
        // 显示动画
        setTimeout(() => {
            preview.style.opacity = '1';
            preview.style.transform = 'translateY(-50%) translateX(0)';
        }, 50);
    }
    
    // 隐藏城市预览
    hideCityPreview() {
        const preview = document.querySelector('.city-preview');
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
    
    // 高亮城市
    highlightCity(city) {
        // 移除之前的高亮
        document.querySelectorAll('.city-highlight').forEach(el => {
            el.remove();
        });
        
        // 创建高亮效果
        const highlight = document.createElement('div');
        highlight.className = 'city-highlight';
        highlight.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, 
                rgba(102, 126, 234, 0.1) 0%, transparent 50%);
            pointer-events: none;
            z-index: 999;
            animation: highlightPulse 2s ease-out;
        `;
        
        document.body.appendChild(highlight);
        
        // 添加高亮动画
        if (!document.getElementById('highlight-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'highlight-pulse-style';
            style.textContent = `
                @keyframes highlightPulse {
                    0% { opacity: 0; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.1); }
                    100% { opacity: 0; transform: scale(1.2); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 3秒后移除高亮
        setTimeout(() => {
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
        }, 2000);
    }

    // 创建增强的弹窗内容 - 显示城市照片和故事
    async createEnhancedPopup(city) {
        const typeInfo = city.typeInfo;
        const visitInfo = city.visitDate ? 
            `<div class="visit-date">📅 访问时间: ${new Date(city.visitDate).toLocaleDateString('zh-CN')}</div>` : '';
        
        const ratingStars = '⭐'.repeat(city.rating);
        const tags = city.tags.map(tag => `<span class="city-tag">${tag}</span>`).join('');
        
        return `
            <div class="city-popup">
                <div class="popup-header" style="
                    background: linear-gradient(135deg, ${typeInfo.color}, ${typeInfo.color}dd);
                    color: white;
                    padding: 1rem;
                    margin: -1rem -1rem 1rem -1rem;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                ">
                    <div class="city-icon" style="font-size: 2rem; margin-bottom: 0.5rem;">
                        ${typeInfo.icon}
                    </div>
                    <h3 style="margin: 0; font-size: 1.2rem;">${city.name}</h3>
                    <div style="font-size: 0.9rem; opacity: 0.9;">${typeInfo.name}</div>
                </div>
                
                ${city.photo ? `
                    <div class="city-photo" style="margin-bottom: 1rem; position: relative;">
                        <img src="${city.photo}" alt="${city.name}" style="
                            width: 100%;
                            height: 150px;
                            object-fit: cover;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        " />
                        <div style="
                            position: absolute;
                            top: 8px;
                            right: 8px;
                            background: rgba(0,0,0,0.7);
                            color: white;
                            padding: 2px 6px;
                            border-radius: 4px;
                            font-size: 10px;
                            font-weight: 500;
                        ">原始图片</div>
                    </div>
                ` : `
                    <div class="no-photo" style="
                        background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
                        height: 150px;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 1rem;
                        border: 2px dashed #d1d5db;
                        color: #6b7280;
                        font-size: 0.9rem;
                    ">
                        ${this.openAIConfig.apiKey ? 
                            `<button onclick="mapManager.generateCityImage('${city.name}')" style="
                                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                                color: white;
                                border: none;
                                padding: 0.5rem 1rem;
                                border-radius: 20px;
                                font-size: 0.8rem;
                                cursor: pointer;
                            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                🎨 生成AI图片
                            </button>` : 
                            '暂无图片'
                        }
                    </div>
                `}
                
                <div class="city-description" style="
                    color: #374151;
                    line-height: 1.6;
                    margin-bottom: 1rem;
                ">${city.description}</div>
                
                ${city.story ? `
                    <div class="city-story" style="
                        background: rgba(139, 92, 246, 0.1);
                        padding: 0.8rem;
                        border-radius: 8px;
                        border-left: 4px solid ${typeInfo.color};
                        margin-bottom: 1rem;
                        font-style: italic;
                        color: #6b7280;
                    ">${city.story}</div>
                ` : ''}
                
                <div class="city-meta" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                ">
                    <span class="city-rating">${ratingStars}</span>
                    ${visitInfo}
                </div>
                
                ${tags ? `
                    <div class="city-tags" style="
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                        margin-bottom: 1rem;
                    ">${tags}</div>
                ` : ''}
                
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="mapManager.showCityDetails('${city.name}')" style="
                        background: linear-gradient(135deg, ${typeInfo.color}, ${typeInfo.color}dd);
                        color: white;
                        border: none;
                        padding: 0.8rem 1.5rem;
                        border-radius: 25px;
                        font-weight: 600;
                        cursor: pointer;
                        flex: 1;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        📖 查看详细故事
                    </button>
                    
                                     ${!city.photo ? `
                     <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                         ${this.openAIConfig.apiKey ? `
                             <button onclick="mapManager.generateCityImage('${city.name}')" style="
                                 background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                                 color: white;
                                 border: none;
                                 padding: 0.6rem 1rem;
                                 border-radius: 20px;
                                 font-weight: 600;
                                 cursor: pointer;
                                 transition: all 0.3s ease;
                                 font-size: 0.8rem;
                             " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                 🎨 AI生成
                             </button>
                         ` : ''}
                         
                         ${this.freeAPIs.unsplash.accessKey ? `
                             <button onclick="mapManager.generateCityImageWithFreeAPI('${city.name}', 'unsplash')" style="
                                 background: linear-gradient(135deg, #10b981, #059669);
                                 color: white;
                                 border: none;
                                 padding: 0.6rem 1rem;
                                 border-radius: 20px;
                                 font-weight: 600;
                                 cursor: pointer;
                                 transition: all 0.3s ease;
                                 font-size: 0.8rem;
                             " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                 📸 Unsplash
                             </button>
                         ` : ''}
                         
                         ${this.freeAPIs.pixabay.apiKey ? `
                             <button onclick="mapManager.generateCityImageWithFreeAPI('${city.name}', 'pixabay')" style="
                                 background: linear-gradient(135deg, #f59e0b, #d97706);
                                 color: white;
                                 border: none;
                                 padding: 0.6rem 1rem;
                                 border-radius: 20px;
                                 font-weight: 600;
                                 cursor: pointer;
                                 transition: all 0.3s ease;
                                 font-size: 0.8rem;
                             " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                 🖼️ Pixabay
                             </button>
                         ` : ''}
                         
                         ${this.freeAPIs.pexels.apiKey ? `
                             <button onclick="mapManager.generateCityImageWithFreeAPI('${city.name}', 'pexels')" style="
                                 background: linear-gradient(135deg, #ef4444, #dc2626);
                                 color: white;
                                 border: none;
                                 padding: 0.6rem 1rem;
                                 border-radius: 20px;
                                 font-weight: 600;
                                 cursor: pointer;
                                 transition: all 0.3s ease;
                                 font-size: 0.8rem;
                             " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                 🎭 Pexels
                             </button>
                         ` : ''}
                     </div>
                 ` : ''}
                </div>
            </div>
        `;
    }

    // 渲染地图控制面板 - 符合要求3的交互功能
    renderMapControls() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;
        
        // 创建控制面板
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'map-controls';
        controlsContainer.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 1rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            min-width: 200px;
        `;
        
        // 标题
        const title = document.createElement('h3');
        title.textContent = '🗺️ 我的足迹';
        title.style.cssText = `
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
            color: #374151;
            text-align: center;
        `;
        controlsContainer.appendChild(title);
        
        // 类型筛选器
        const filterTitle = document.createElement('div');
        filterTitle.textContent = '按类型筛选:';
        filterTitle.style.cssText = `
            font-size: 0.9rem;
            color: #000000;
            margin-bottom: 0.5rem;
            font-weight: 600;
            text-shadow: none;
        `;
        controlsContainer.appendChild(filterTitle);
        
        // 筛选按钮
        const filterButtons = document.createElement('div');
        filterButtons.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1rem;
        `;
        
        // 全部按钮
        const allButton = this.createFilterButton('all', '🌍 全部足迹', true);
        filterButtons.appendChild(allButton);
        
        // 类型按钮
        Object.entries(this.cityTypes).forEach(([type, info]) => {
            const button = this.createFilterButton(type, `${info.icon} ${info.name}`);
            filterButtons.appendChild(button);
        });
        
        controlsContainer.appendChild(filterButtons);
        
        // OpenAI API 设置区域
        if (this.openAIConfig.apiKey) {
            const openAISection = document.createElement('div');
            openAISection.style.cssText = `
                padding-top: 1rem;
                border-top: 1px solid rgba(0,0,0,0.1);
                margin-bottom: 1rem;
            `;
            
            const openAITitle = document.createElement('div');
            openAITitle.textContent = '🤖 AI图片生成';
            openAITitle.style.cssText = `
                font-size: 0.9rem;
                color: #6b7280;
                margin-bottom: 0.5rem;
                text-align: center;
                font-weight: 600;
            `;
            openAISection.appendChild(openAITitle);
            
            const generateAllBtn = document.createElement('button');
            generateAllBtn.textContent = '🎨 生成所有城市图片';
            generateAllBtn.style.cssText = `
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                cursor: pointer;
                width: 100%;
                transition: all 0.3s ease;
                margin-bottom: 0.5rem;
            `;
            generateAllBtn.onclick = () => this.generateAllCityImages();
            generateAllBtn.onmouseover = () => generateAllBtn.style.transform = 'scale(1.02)';
            generateAllBtn.onmouseout = () => generateAllBtn.style.transform = 'scale(1)';
            openAISection.appendChild(generateAllBtn);
            
            const cacheInfo = document.createElement('div');
                    cacheInfo.style.cssText = `
            font-size: 0.7rem;
            color: #000000;
            text-align: center;
            font-weight: 500;
            text-shadow: none;
        `;
            cacheInfo.innerHTML = `已缓存: ${this.imageCache.size} 张图片`;
            openAISection.appendChild(cacheInfo);
            
            controlsContainer.appendChild(openAISection);
        } else {
            const openAISection = document.createElement('div');
            openAISection.style.cssText = `
                padding-top: 1rem;
                border-top: 1px solid rgba(0,0,0,0.1);
                margin-bottom: 1rem;
            `;
            
            const openAITitle = document.createElement('div');
            openAITitle.textContent = '🤖 AI图片生成';
                    openAITitle.style.cssText = `
            font-size: 0.9rem;
            color: #000000;
            margin-bottom: 0.5rem;
            text-align: center;
            font-weight: 600;
            text-shadow: none;
        `;
            openAISection.appendChild(openAITitle);
            
            const apiKeyInput = document.createElement('input');
            apiKeyInput.type = 'password';
            apiKeyInput.placeholder = '输入OpenAI API密钥';
            apiKeyInput.style.cssText = `
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 0.8rem;
                margin-bottom: 0.5rem;
                box-sizing: border-box;
            `;
            openAISection.appendChild(apiKeyInput);
            
            const setKeyBtn = document.createElement('button');
            setKeyBtn.textContent = '🔑 设置API密钥';
            setKeyBtn.style.cssText = `
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                cursor: pointer;
                width: 100%;
                transition: all 0.3s ease;
            `;
            setKeyBtn.onclick = () => {
                const key = apiKeyInput.value.trim();
                if (key) {
                    this.setOpenAIAPIKey(key);
                    apiKeyInput.value = '';
                    this.renderMapControls(); // 重新渲染控制面板
                }
            };
            setKeyBtn.onmouseover = () => setKeyBtn.style.transform = 'scale(1.02)';
            setKeyBtn.onmouseout = () => setKeyBtn.style.transform = 'scale(1)';
            openAISection.appendChild(setKeyBtn);
            
            controlsContainer.appendChild(openAISection);
        }
        
        // 免费API设置区域
        const freeAPISection = document.createElement('div');
        freeAPISection.style.cssText = `
            padding-top: 1rem;
            border-top: 1px solid rgba(0,0,0,0.1);
            margin-bottom: 1rem;
        `;
        
        const freeAPITitle = document.createElement('div');
        freeAPITitle.textContent = '🆓 免费图片API';
        freeAPITitle.style.cssText = `
            font-size: 0.9rem;
            color: #000000;
            margin-bottom: 0.5rem;
            text-align: center;
            font-weight: 600;
            text-shadow: none;
        `;
        freeAPISection.appendChild(freeAPITitle);
        
        // Unsplash API设置
        const unsplashSection = document.createElement('div');
        unsplashSection.style.cssText = `
            margin-bottom: 1rem;
            padding: 0.5rem;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(16, 185, 129, 0.2);
        `;
        
        const unsplashTitle = document.createElement('div');
        unsplashTitle.textContent = '📸 Unsplash';
        unsplashTitle.style.cssText = `
            font-size: 0.8rem;
            color: #059669;
            margin-bottom: 0.5rem;
            font-weight: 600;
        `;
        unsplashSection.appendChild(unsplashTitle);
        
        const unsplashAccessInput = document.createElement('input');
        unsplashAccessInput.type = 'text';
        unsplashAccessInput.placeholder = 'Access Key';
        unsplashAccessInput.style.cssText = `
            width: 100%;
            padding: 0.4rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.7rem;
            margin-bottom: 0.3rem;
            box-sizing: border-box;
        `;
        unsplashSection.appendChild(unsplashAccessInput);
        
        const unsplashSecretInput = document.createElement('input');
        unsplashSecretInput.type = 'password';
        unsplashSecretInput.placeholder = 'Secret Key';
        unsplashSecretInput.style.cssText = `
            width: 100%;
            padding: 0.4rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.7rem;
            margin-bottom: 0.3rem;
            box-sizing: border-box;
        `;
        unsplashSection.appendChild(unsplashSecretInput);
        
        const unsplashSetBtn = document.createElement('button');
        unsplashSetBtn.textContent = '🔑 设置';
        unsplashSetBtn.style.cssText = `
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-size: 0.7rem;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
        `;
        unsplashSetBtn.onclick = () => {
            const accessKey = unsplashAccessInput.value.trim();
            const secretKey = unsplashSecretInput.value.trim();
            if (accessKey) {
                this.setFreeAPIKey('unsplash', accessKey, secretKey);
                unsplashAccessInput.value = '';
                unsplashSecretInput.value = '';
                this.renderMapControls(); // 重新渲染控制面板
            }
        };
        unsplashSetBtn.onmouseover = () => unsplashSetBtn.style.transform = 'scale(1.02)';
        unsplashSetBtn.onmouseout = () => unsplashSetBtn.style.transform = 'scale(1)';
        unsplashSection.appendChild(unsplashSetBtn);
        
        const unsplashStatus = document.createElement('div');
        unsplashStatus.style.cssText = `
            font-size: 0.7rem;
            color: ${this.freeAPIs.unsplash.accessKey ? '#059669' : '#9ca3af'};
            text-align: center;
            margin-top: 0.3rem;
        `;
        unsplashStatus.textContent = this.freeAPIs.unsplash.accessKey ? '✅ 已激活' : '❌ 未设置';
        unsplashSection.appendChild(unsplashStatus);
        
        freeAPISection.appendChild(unsplashSection);
        
        // Pixabay API设置
        const pixabaySection = document.createElement('div');
        pixabaySection.style.cssText = `
            margin-bottom: 1rem;
            padding: 0.5rem;
            background: rgba(245, 158, 11, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(245, 158, 11, 0.2);
        `;
        
        const pixabayTitle = document.createElement('div');
        pixabayTitle.textContent = '🖼️ Pixabay';
        pixabayTitle.style.cssText = `
            font-size: 0.8rem;
            color: #d97706;
            margin-bottom: 0.5rem;
            font-weight: 600;
        `;
        pixabaySection.appendChild(pixabayTitle);
        
        const pixabayInput = document.createElement('input');
        pixabayInput.type = 'password';
        pixabayInput.placeholder = 'API Key';
        pixabayInput.style.cssText = `
            width: 100%;
            padding: 0.4rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.7rem;
            margin-bottom: 0.3rem;
            box-sizing: border-box;
        `;
        pixabaySection.appendChild(pixabayInput);
        
        const pixabaySetBtn = document.createElement('button');
        pixabaySetBtn.textContent = '🔑 设置';
        pixabaySetBtn.style.cssText = `
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-size: 0.7rem;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
        `;
        pixabaySetBtn.onclick = () => {
            const key = pixabayInput.value.trim();
            if (key) {
                this.setFreeAPIKey('pixabay', key);
                pixabayInput.value = '';
                this.renderMapControls(); // 重新渲染控制面板
            }
        };
        pixabaySetBtn.onmouseover = () => pixabaySetBtn.style.transform = 'scale(1.02)';
        pixabaySetBtn.onmouseout = () => pixabaySetBtn.style.transform = 'scale(1)';
        pixabaySection.appendChild(pixabaySetBtn);
        
        const pixabayStatus = document.createElement('div');
        pixabayStatus.style.cssText = `
            font-size: 0.7rem;
            color: ${this.freeAPIs.pixabay.apiKey ? '#d97706' : '#9ca3af'};
            text-align: center;
            margin-top: 0.3rem;
        `;
        pixabayStatus.textContent = this.freeAPIs.pixabay.apiKey ? '✅ 已激活' : '❌ 未设置';
        pixabaySection.appendChild(pixabayStatus);
        
        freeAPISection.appendChild(pixabaySection);
        
        // Pexels API设置
        const pexelsSection = document.createElement('div');
        pexelsSection.style.cssText = `
            margin-bottom: 1rem;
            padding: 0.5rem;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(239, 68, 68, 0.2);
        `;
        
        const pexelsTitle = document.createElement('div');
        pexelsTitle.textContent = '🎭 Pexels';
        pexelsTitle.style.cssText = `
            font-size: 0.8rem;
            color: #dc2626;
            margin-bottom: 0.5rem;
            font-weight: 600;
        `;
        pexelsSection.appendChild(pexelsTitle);
        
        const pexelsInput = document.createElement('input');
        pexelsInput.type = 'password';
        pexelsInput.placeholder = 'API Key';
        pexelsInput.style.cssText = `
            width: 100%;
            padding: 0.4rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.7rem;
            margin-bottom: 0.3rem;
            box-sizing: border-box;
        `;
        pexelsSection.appendChild(pexelsInput);
        
        const pexelsSetBtn = document.createElement('button');
        pexelsSetBtn.textContent = '🔑 设置';
        pexelsSetBtn.style.cssText = `
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-size: 0.7rem;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
        `;
        pexelsSetBtn.onclick = () => {
            const key = pexelsInput.value.trim();
            if (key) {
                this.setFreeAPIKey('pexels', key);
                pexelsInput.value = '';
                this.renderMapControls(); // 重新渲染控制面板
            }
        };
        pexelsSetBtn.onmouseover = () => pexelsSetBtn.style.transform = 'scale(1.02)';
        pexelsSetBtn.onmouseout = () => pexelsSetBtn.style.transform = 'scale(1)';
        pexelsSection.appendChild(pexelsSetBtn);
        
        const pexelsStatus = document.createElement('div');
        pexelsStatus.style.cssText = `
            font-size: 0.7rem;
            color: ${this.freeAPIs.pexels.apiKey ? '#dc2626' : '#9ca3af'};
            text-align: center;
            margin-top: 0.3rem;
        `;
        pexelsStatus.textContent = this.freeAPIs.pexels.apiKey ? '✅ 已激活' : '❌ 未设置';
        pexelsSection.appendChild(pexelsStatus);
        
        freeAPISection.appendChild(pexelsSection);
        
        // 免费API信息
        const freeAPIInfo = document.createElement('div');
        freeAPIInfo.style.cssText = `
            font-size: 0.7rem;
            color: #6b7280;
            text-align: center;
            padding: 0.5rem;
            background: rgba(0,0,0,0.05);
            border-radius: 6px;
            margin-top: 0.5rem;
        `;
        freeAPIInfo.innerHTML = `
            <p style="margin: 0.2rem 0;">💡 这些免费API提供高质量的城市照片，无需付费即可使用</p>
            <p style="margin: 0.2rem 0;">📊 每日限制: Unsplash(1000次) | Pixabay(5000次) | Pexels(200次)</p>
        `;
        freeAPISection.appendChild(freeAPIInfo);
        
        controlsContainer.appendChild(freeAPISection);

        // 统计信息
        const stats = document.createElement('div');
        stats.className = 'map-stats';
        stats.style.cssText = `
            font-size: 0.8rem;
            color: #9ca3af;
            text-align: center;
            padding-top: 1rem;
            border-top: 1px solid rgba(0,0,0,0.1);
        `;
        stats.innerHTML = `
            <div>📍 总城市数: ${this.allCityData.length}</div>
            <div>🎯 当前显示: <span id="current-city-count">${this.allCityData.length}</span></div>
        `;
        controlsContainer.appendChild(stats);
        
        mapContainer.appendChild(controlsContainer);
    }

    // 创建筛选按钮
    createFilterButton(type, label, isActive = false) {
        const button = document.createElement('button');
        button.textContent = label;
        button.dataset.type = type;
        button.className = `filter-btn ${isActive ? 'active' : ''}`;
        button.style.cssText = `
            background: ${isActive ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#f0f0f0'};
            color: ${isActive ? 'white' : '#000000'};
            border: 2px solid ${isActive ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0,0,0,0.3)'};
            padding: 0.6rem 1rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            text-shadow: none;
            box-shadow: ${isActive ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'};
        `;
        
        button.addEventListener('click', () => {
            this.filterMapByType(type);
        });
        
        return button;
    }

    // 按类型筛选地图 - 符合要求3的交互功能
    filterMapByType(type) {
        this.currentFilter = type;
        
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const isActive = btn.dataset.type === type;
            btn.classList.toggle('active', isActive);
            btn.style.background = isActive ? 
                'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 
                '#f0f0f0';
            btn.style.color = isActive ? 'white' : '#000000';
            btn.style.border = isActive ? 
                '2px solid rgba(139, 92, 246, 0.3)' : 
                '2px solid rgba(0,0,0,0.3)';
            btn.style.textShadow = 'none';
            btn.style.boxShadow = isActive ? 
                '0 4px 12px rgba(139, 92, 246, 0.3)' : 
                '0 2px 8px rgba(0,0,0,0.1)';
        });
        
        // 筛选城市数据
        const filteredCities = type === 'all' ? 
            this.allCityData : 
            this.allCityData.filter(city => city.type === type);
        
        // 更新统计信息
        const currentCount = document.getElementById('current-city-count');
        if (currentCount) {
            currentCount.textContent = filteredCities.length;
        }
        
        // 清除所有标记
        this.allMarkersGroup.clearLayers();
        
        // 重新添加筛选后的标记
        filteredCities.forEach((city, index) => {
            const marker = this.createCityMarker(city, index);
            this.allMarkersGroup.addLayer(marker);
        });
        
        console.log(`🗺️ 地图筛选完成: ${type === 'all' ? '全部' : this.cityTypes[type].name} (${filteredCities.length}个城市)`);
    }

    // 显示城市详情 - 符合要求3的点击展开功能
    showCityDetails(city) {
        console.log(`📖 显示城市详情: ${city.name}`);
        
        // 创建详情弹窗
        const modal = document.createElement('div');
        modal.className = 'city-details-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 20px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            animation: modalSlideIn 0.3s ease-out;
        `;
        
        const typeInfo = city.typeInfo;
        
        modalContent.innerHTML = `
            <div class="modal-header" style="
                background: linear-gradient(135deg, ${typeInfo.color}, ${typeInfo.color}dd);
                color: white;
                padding: 2rem;
                border-radius: 20px 20px 0 0;
                text-align: center;
                position: relative;
            ">
                <button class="close-btn" onclick="this.closest('.city-details-modal').remove()" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.2rem;
                ">×</button>
                
                <div class="city-icon" style="font-size: 3rem; margin-bottom: 1rem;">
                    ${typeInfo.icon}
                </div>
                <h2 style="margin: 0; font-size: 2rem;">${city.name}</h2>
                <div style="font-size: 1.1rem; opacity: 0.9; margin-top: 0.5rem;">${typeInfo.name}</div>
            </div>
            
            <div class="modal-body" style="padding: 2rem;">
                ${city.photo ? `
                    <div class="city-photo-large" style="margin-bottom: 2rem;">
                        <img src="${city.photo}" alt="${city.name}" style="
                            width: 100%;
                            height: 250px;
                            object-fit: cover;
                            border-radius: 15px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                        " />
                    </div>
                ` : ''}
                
                <div class="city-description-large" style="
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #374151;
                    margin-bottom: 2rem;
                ">${city.description}</div>
                
                ${city.story ? `
                    <div class="city-story-large" style="
                        background: rgba(139, 92, 246, 0.1);
                        padding: 1.5rem;
                        border-radius: 15px;
                        border-left: 6px solid ${typeInfo.color};
                        margin-bottom: 2rem;
                        font-style: italic;
                        color: #6b7280;
                        font-size: 1.1rem;
                        line-height: 1.7;
                    ">${city.story}</div>
                ` : ''}
                
                <div class="city-meta-large" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: rgba(0,0,0,0.05);
                    border-radius: 15px;
                ">
                    <div class="meta-item">
                        <div class="meta-label">📍 城市类型</div>
                        <div class="meta-value">${typeInfo.name}</div>
                    </div>
                    ${city.visitDate ? `
                        <div class="meta-item">
                            <div class="meta-label">📅 访问时间</div>
                            <div class="meta-value">${new Date(city.visitDate).toLocaleDateString('zh-CN')}</div>
                        </div>
                    ` : ''}
                    <div class="meta-item">
                        <div class="meta-label">⭐ 推荐指数</div>
                        <div class="meta-value">${'⭐'.repeat(city.rating)}</div>
                    </div>
                </div>
                
                ${city.tags.length > 0 ? `
                    <div class="city-tags-large">
                        <div class="tags-label" style="
                            font-weight: 600;
                            color: #374151;
                            margin-bottom: 1rem;
                        ">🏷️ 城市标签</div>
                        <div class="tags-container" style="
                            display: flex;
                            flex-wrap: wrap;
                            gap: 0.8rem;
                        ">
                            ${city.tags.map(tag => `
                                <span class="city-tag-large" style="
                                    background: linear-gradient(135deg, ${typeInfo.color}, ${typeInfo.color}dd);
                                    color: white;
                                    padding: 0.6rem 1.2rem;
                                    border-radius: 20px;
                                    font-size: 0.9rem;
                                    font-weight: 500;
                                ">${tag}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes modalSlideIn {
                from {
                    transform: translateY(-50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // 清理样式
        setTimeout(() => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 1000);
    }

    // OpenAI API 图片生成方法
    async generateCityImage(city) {
        try {
            // 检查API密钥
            if (!this.openAIConfig.apiKey) {
                console.warn('⚠️ OpenAI API密钥未设置，无法生成城市图片');
                return null;
            }

            // 检查缓存
            if (this.imageCache.has(city.name)) {
                console.log(`✅ 从缓存获取 ${city.name} 的图片`);
                return this.imageCache.get(city.name);
            }

            // 检查是否正在生成
            if (this.generatingImages.has(city.name)) {
                console.log(`⏳ ${city.name} 的图片正在生成中...`);
                return null;
            }

            // 防止重复生成
            this.generatingImages.add(city.name);

            console.log(`🎨 开始为 ${city.name} 生成AI图片...`);

            // 构建图片描述
            const imagePrompt = this.buildImagePrompt(city);
            
            // 调用OpenAI API
            const imageUrl = await this.callOpenAIImageAPI(imagePrompt);
            
            if (imageUrl) {
                // 缓存图片URL
                this.imageCache.set(city.name, imageUrl);
                console.log(`✅ ${city.name} 的AI图片生成成功`);
            }

            return imageUrl;

        } catch (error) {
            console.error(`❌ 为 ${city.name} 生成AI图片失败:`, error);
            return null;
        } finally {
            // 移除生成状态
            this.generatingImages.delete(city.name);
        }
    }

    // 构建图片生成提示词
    buildImagePrompt(city) {
        const typeInfo = this.cityTypes[city.type];
        const basePrompt = `中国城市 ${city.name}，${city.description}`;
        
        // 根据城市类型添加特定风格
        const stylePrompts = {
            'music': '音乐主题，充满活力的城市景观，霓虹灯效果，现代感强烈',
            'culture': '历史文化氛围浓厚，古建筑与现代建筑融合，传统与现代并存',
            'nature': '自然风光优美，山水相依，绿色生态，人与自然和谐',
            'food': '美食文化丰富，热闹的街市，各种美食摊位，烟火气息浓厚',
            'adventure': '充满冒险精神，山地景观，户外活动场景，刺激与挑战'
        };

        const stylePrompt = stylePrompts[city.type] || '';
        const finalPrompt = `${basePrompt}。${stylePrompt}。高质量摄影风格，4K分辨率，真实感强，适合作为旅游宣传图片。`;

        return finalPrompt;
    }

    // 调用OpenAI图片生成API
    async callOpenAIImageAPI(prompt) {
        try {
            const response = await fetch(`${this.openAIConfig.baseURL}/images/generations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openAIConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.openAIConfig.imageModel,
                    prompt: prompt,
                    n: 1,
                    size: '1024x1024',
                    quality: 'standard',
                    style: 'natural'
                })
            });

            if (!response.ok) {
                throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.data && data.data[0] && data.data[0].url) {
                return data.data[0].url;
            } else {
                throw new Error('API返回数据格式错误');
            }

        } catch (error) {
            console.error('❌ OpenAI API调用失败:', error);
            throw error;
        }
    }

    // 设置OpenAI API密钥
    setOpenAIAPIKey(apiKey) {
        this.openAIConfig.apiKey = apiKey;
        console.log('✅ OpenAI API密钥已设置');
        
        // 保存到本地存储
        try {
            localStorage.setItem('openai_api_key', apiKey);
        } catch (error) {
            console.warn('⚠️ 无法保存API密钥到本地存储:', error);
        }
    }

    // 从本地存储加载API密钥
    loadOpenAIAPIKey() {
        try {
            const savedKey = localStorage.getItem('openai_api_key');
            if (savedKey) {
                this.openAIConfig.apiKey = savedKey;
                console.log('✅ 已从本地存储加载OpenAI API密钥');
                return true;
            }
        } catch (error) {
            console.warn('⚠️ 无法从本地存储加载API密钥:', error);
        }
        return false;
    }

    // 批量生成城市图片
    async generateAllCityImages() {
        if (!this.openAIConfig.apiKey) {
            console.warn('⚠️ 请先设置OpenAI API密钥');
            return;
        }

        const citiesWithoutPhotos = this.allCityData.filter(city => !city.photo && !this.imageCache.has(city.name));
        console.log(`🎨 开始为 ${citiesWithoutPhotos.length} 个城市生成AI图片...`);

        // 分批处理，避免API限制
        const batchSize = 5;
        for (let i = 0; i < citiesWithoutPhotos.length; i += batchSize) {
            const batch = citiesWithoutPhotos.slice(i, i + batchSize);
            console.log(`📦 处理批次 ${Math.floor(i/batchSize) + 1}/${Math.ceil(citiesWithoutPhotos.length/batchSize)}`);
            
            await Promise.all(batch.map(city => this.generateCityImage(city.name)));
            
            // 添加延迟，避免API限制
            if (i + batchSize < citiesWithoutPhotos.length) {
                console.log('⏳ 等待2秒后继续...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        console.log('✅ 所有城市图片生成完成！');
    }

    // 使用免费API生成城市图片
    async generateCityImageWithFreeAPI(city, apiType = 'unsplash') {
        const cityData = this.allCityData.find(c => c.name === city);
        if (!cityData) {
            console.error(`❌ 未找到城市: ${city}`);
            return null;
        }

        // 检查缓存
        const cacheKey = `${city}_${apiType}`;
        if (this.imageCache.has(cacheKey)) {
            console.log(`✅ 从缓存获取 ${city} 的 ${apiType} 图片`);
            return this.imageCache.get(cacheKey);
        }

        // 检查是否正在生成
        if (this.generatingImages.has(cacheKey)) {
            console.log(`⏳ ${city} 的 ${apiType} 图片正在生成中...`);
            return null;
        }

        this.generatingImages.add(cacheKey);

        try {
            let imageUrl = null;
            
            switch (apiType) {
                case 'unsplash':
                    imageUrl = await this.callUnsplashAPI(cityData);
                    break;
                case 'pixabay':
                    imageUrl = await this.callPixabayAPI(cityData);
                    break;
                case 'pexels':
                    imageUrl = await this.callPexelsAPI(cityData);
                    break;
                default:
                    throw new Error(`不支持的API类型: ${apiType}`);
            }

            if (imageUrl) {
                // 缓存结果
                this.imageCache.set(cacheKey, imageUrl);
                console.log(`✅ ${city} 的 ${apiType} 图片生成成功: ${imageUrl}`);
                
                // 更新城市数据
                cityData.photo = imageUrl;
                
                // 刷新地图标记
                this.refreshCityMarker(city);
                
                return imageUrl;
            }
        } catch (error) {
            console.error(`❌ 使用 ${apiType} 生成 ${city} 图片失败:`, error);
        } finally {
            this.generatingImages.delete(cacheKey);
        }

        return null;
    }

    // 调用Unsplash API
    async callUnsplashAPI(city) {
        if (!this.freeAPIs.unsplash.accessKey) {
            throw new Error('Unsplash API密钥未设置');
        }

        const query = `${city.name} city landscape architecture`;
        const url = `${this.freeAPIs.unsplash.baseURL}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Client-ID ${this.freeAPIs.unsplash.accessKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Unsplash API错误: ${response.status}`);
        }

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.regular;
        }

        throw new Error('未找到合适的图片');
    }

    // 调用Pixabay API
    async callPixabayAPI(city) {
        if (!this.freeAPIs.pixabay.apiKey) {
            throw new Error('Pixabay API密钥未设置');
        }

        const query = `${city.name} city`;
        const url = `${this.freeAPIs.pixabay.baseURL}?key=${this.freeAPIs.pixabay.apiKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=1`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Pixabay API错误: ${response.status}`);
        }

        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
            return data.hits[0].webformatURL;
        }

        throw new Error('未找到合适的图片');
    }

    // 调用Pexels API
    async callPexelsAPI(city) {
        if (!this.freeAPIs.pexels.apiKey) {
            throw new Error('Pexels API密钥未设置');
        }

        const query = `${city.name} city`;
        const url = `${this.freeAPIs.pexels.baseURL}/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

        const response = await fetch(url, {
            headers: {
                'Authorization': this.freeAPIs.pexels.apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Pexels API错误: ${response.status}`);
        }

        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.medium;
        }

        throw new Error('未找到合适的图片');
    }

    // 设置免费API密钥
    setFreeAPIKey(apiType, key, secretKey = '') {
        if (apiType === 'unsplash') {
            this.freeAPIs.unsplash.accessKey = key;
            this.freeAPIs.unsplash.secretKey = secretKey;
        } else if (apiType === 'pixabay') {
            this.freeAPIs.pixabay.apiKey = key;
        } else if (apiType === 'pexels') {
            this.freeAPIs.pexels.apiKey = key;
        }

        // 保存到本地存储
        try {
            localStorage.setItem(`free_api_${apiType}`, JSON.stringify({
                key,
                secretKey,
                timestamp: Date.now()
            }));
            console.log(`✅ ${apiType} API密钥已设置`);
        } catch (error) {
            console.warn(`⚠️ 无法保存${apiType} API密钥到本地存储:`, error);
        }
    }

    // 加载免费API密钥
    loadFreeAPIKeys() {
        Object.keys(this.freeAPIs).forEach(apiType => {
            try {
                const saved = localStorage.getItem(`free_api_${apiType}`);
                if (saved) {
                    const config = JSON.parse(saved);
                    if (apiType === 'unsplash') {
                        this.freeAPIs.unsplash.accessKey = config.key;
                        this.freeAPIs.unsplash.secretKey = config.secretKey;
                    } else if (apiType === 'pixabay') {
                        this.freeAPIs.pixabay.apiKey = config.key;
                    } else if (apiType === 'pexels') {
                        this.freeAPIs.pexels.apiKey = config.key;
                    }
                    console.log(`✅ 已从本地存储加载${apiType} API密钥`);
                }
            } catch (error) {
                console.warn(`⚠️ 无法从本地存储加载${apiType} API密钥:`, error);
            }
        });
    }

    // 刷新城市标记（更新弹窗内容）
    refreshCityMarker(cityName) {
        // 这里可以添加刷新标记的逻辑
        console.log(`🔄 刷新城市标记: ${cityName}`);
    }

    // 显示地图加载状态
    showMapLoading(container) {
        container.innerHTML = `
            <div class="map-loading" style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
                color: #6b7280;
                font-size: 1.1rem;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
                border-radius: 12px;
                position: relative;
                overflow: hidden;
            ">
                <!-- 背景装饰 -->
                <div style="
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
                    animation: pulse 2s ease-in-out infinite;
                "></div>
                
                <!-- 加载动画 -->
                <div class="loading-container" style="position: relative; z-index: 2;">
                    <div class="loading-spinner" style="
                        width: 60px;
                        height: 60px;
                        border: 4px solid rgba(139, 92, 246, 0.2);
                        border-top: 4px solid #8b5cf6;
                        border-right: 4px solid #764ba2;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 1.5rem;
                        position: relative;
                    ">
                        <div style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            font-size: 20px;
                            animation: bounce 1s ease-in-out infinite;
                        ">🗺️</div>
                    </div>
                    
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">
                        正在加载"我的足迹"地图...
                    </div>
                    <div style="font-size: 0.9rem; opacity: 0.7; text-align: center; line-height: 1.4;">
                        正在获取城市数据和地图资源<br>
                        <span id="loading-progress">初始化中...</span>
                    </div>
                </div>
                
                <!-- 进度条 -->
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: rgba(139, 92, 246, 0.2);
                    overflow: hidden;
                ">
                    <div id="loading-bar" style="
                        height: 100%;
                        background: linear-gradient(90deg, #8b5cf6, #764ba2);
                        width: 0%;
                        transition: width 0.3s ease;
                        animation: shimmer 2s ease-in-out infinite;
                    "></div>
                </div>
            </div>
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }
            @keyframes bounce {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.2); }
            }
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
        
        // 模拟加载进度
        this.simulateLoadingProgress();
    }
    
    // 模拟加载进度
    simulateLoadingProgress() {
        const progressText = document.getElementById('loading-progress');
        const progressBar = document.getElementById('loading-bar');
        
        if (!progressText || !progressBar) return;
        
        const steps = [
            { text: '检查地图环境...', progress: 20 },
            { text: '加载地图资源...', progress: 40 },
            { text: '获取城市数据...', progress: 60 },
            { text: '创建地图标记...', progress: 80 },
            { text: '完成初始化...', progress: 100 }
        ];
        
        let currentStep = 0;
        
        const updateProgress = () => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                progressText.textContent = step.text;
                progressBar.style.width = step.progress + '%';
                currentStep++;
                setTimeout(updateProgress, 800);
            }
        };
        
        updateProgress();
    }

    // 显示地图错误
    showMapError(message, details = '') {
        const mapEl = document.getElementById('map');
        if (!mapEl) return;
        
        mapEl.innerHTML = `
            <div class="map-error" style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
                color: #ef4444;
                text-align: center;
                padding: 2rem;
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.05));
                border-radius: 12px;
                border: 2px solid rgba(239, 68, 68, 0.2);
            ">
                <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                <div style="font-size: 1.2rem; margin-bottom: 1rem; font-weight: 600;">${message}</div>
                ${details ? `<div style="color: #6b7280; margin-bottom: 1.5rem; max-width: 400px; line-height: 1.5;">${details}</div>` : ''}
                
                <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                    <button onclick="location.reload()" style="
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        color: white;
                        border: none;
                        padding: 0.8rem 1.5rem;
                        border-radius: 25px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔄 重新加载
                    </button>
                    
                    <button onclick="if(window.mapManager) window.mapManager.forceReinit()" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        padding: 0.8rem 1.5rem;
                        border-radius: 25px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔧 强制重试
                    </button>
                </div>
                
                <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.05); border-radius: 8px; font-size: 0.9rem; color: #6b7280;">
                    <div style="margin-bottom: 0.5rem;"><strong>💡 解决建议:</strong></div>
                    <div>• 使用本地服务器（如 Live Server）打开页面</div>
                    <div>• 检查网络连接和浏览器设置</div>
                    <div>• 尝试刷新页面或清除浏览器缓存</div>
                </div>
            </div>
        `;
    }

    // 地图就绪事件
    onMapReady() {
        console.log('🎉 "我的足迹"互动地图已就绪！');
        
        // 触发自定义事件
        const event = new CustomEvent('mapReady', {
            detail: {
                cityCount: this.allCityData.length,
                mapInstance: this.mapInstance
            }
        });
        document.dispatchEvent(event);
    }

    // 添加地图事件监听
    addMapEventListeners(map) {
        // 地图缩放事件
        map.on('zoomend', () => {
            console.log(`🗺️ 地图缩放级别: ${map.getZoom()}`);
            this.updateMapStats();
        });
        
        // 地图移动事件
        map.on('moveend', () => {
            const center = map.getCenter();
            console.log(`🗺️ 地图中心位置: [${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}]`);
            this.updateMapStats();
        });
        
        // 地图点击事件
        map.on('click', (e) => {
            console.log(`🗺️ 地图点击位置: [${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}]`);
            this.createClickEffect(e.latlng);
        });
        
        // 地图右键事件
        map.on('contextmenu', (e) => {
            this.showContextMenu(e.latlng, e.containerPoint);
        });
        
        // 地图双击事件
        map.on('dblclick', (e) => {
            this.zoomToLocation(e.latlng);
        });
        
        // 添加键盘导航
        this.addKeyboardNavigation(map);
        
        // 添加触摸手势支持
        this.addTouchGestures(map);
        
        // 添加地图状态指示器
        this.addMapStatusIndicator(map);
    }
    
    // 创建点击效果
    createClickEffect(latlng) {
        const mapEl = document.getElementById('map');
        if (!mapEl) return;
        
        const rect = mapEl.getBoundingClientRect();
        const point = this.mapInstance.latLngToContainerPoint(latlng);
        
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: absolute;
            left: ${point.x}px;
            top: ${point.y}px;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: clickRipple 0.6s ease-out;
            transform: translate(-50%, -50%);
        `;
        
        mapEl.style.position = 'relative';
        mapEl.appendChild(effect);
        
        // 添加点击波纹动画
        if (!document.getElementById('click-ripple-style')) {
            const style = document.createElement('style');
            style.id = 'click-ripple-style';
            style.textContent = `
                @keyframes clickRipple {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 600);
    }
    
    // 显示右键菜单
    showContextMenu(latlng, containerPoint) {
        // 移除之前的菜单
        document.querySelectorAll('.map-context-menu').forEach(menu => {
            menu.remove();
        });
        
        const menu = document.createElement('div');
        menu.className = 'map-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${containerPoint.x}px;
            top: ${containerPoint.y}px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            min-width: 150px;
            overflow: hidden;
        `;
        
        menu.innerHTML = `
            <div class="context-item" data-action="zoom-in" style="
                padding: 0.8rem 1rem; cursor: pointer; transition: background 0.2s ease;
                border-bottom: 1px solid rgba(0,0,0,0.1);
            " onmouseover="this.style.background='rgba(102, 126, 234, 0.1)'" onmouseout="this.style.background='transparent'">
                🔍 放大此处
            </div>
            <div class="context-item" data-action="center" style="
                padding: 0.8rem 1rem; cursor: pointer; transition: background 0.2s ease;
                border-bottom: 1px solid rgba(0,0,0,0.1);
            " onmouseover="this.style.background='rgba(102, 126, 234, 0.1)'" onmouseout="this.style.background='transparent'">
                🎯 居中显示
            </div>
            <div class="context-item" data-action="coordinates" style="
                padding: 0.8rem 1rem; cursor: pointer; transition: background 0.2s ease;
            " onmouseover="this.style.background='rgba(102, 126, 234, 0.1)'" onmouseout="this.style.background='transparent'">
                📍 复制坐标
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // 添加菜单事件
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            this.handleContextAction(action, latlng);
            menu.remove();
        });
        
        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }
    
    // 处理右键菜单操作
    handleContextAction(action, latlng) {
        switch (action) {
            case 'zoom-in':
                this.mapInstance.setView(latlng, this.mapInstance.getZoom() + 2);
                break;
            case 'center':
                this.mapInstance.setView(latlng, this.mapInstance.getZoom());
                break;
            case 'coordinates':
                const coords = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
                navigator.clipboard.writeText(coords).then(() => {
                    this.showNotification(`坐标已复制: ${coords}`);
                });
                break;
        }
    }
    
    // 缩放到指定位置
    zoomToLocation(latlng) {
        this.mapInstance.setView(latlng, Math.min(this.mapInstance.getZoom() + 3, 18));
        this.createClickEffect(latlng);
    }
    
    // 添加键盘导航
    addKeyboardNavigation(map) {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const currentCenter = map.getCenter();
            const currentZoom = map.getZoom();
            const moveDistance = 0.01; // 移动距离
            
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    map.setView([currentCenter.lat + moveDistance, currentCenter.lng], currentZoom);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    map.setView([currentCenter.lat - moveDistance, currentCenter.lng], currentZoom);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    map.setView([currentCenter.lat, currentCenter.lng - moveDistance], currentZoom);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    map.setView([currentCenter.lat, currentCenter.lng + moveDistance], currentZoom);
                    break;
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
                    map.setView([35.8617, 104.1954], 4); // 重置到中国中心
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    this.showMapHelp();
                    break;
            }
        });
    }
    
    // 添加触摸手势支持
    addTouchGestures(map) {
        let touchStartTime = 0;
        let touchStartPos = null;
        
        map.on('touchstart', (e) => {
            touchStartTime = Date.now();
            if (e.originalEvent.touches.length === 1) {
                touchStartPos = {
                    x: e.originalEvent.touches[0].clientX,
                    y: e.originalEvent.touches[0].clientY
                };
            }
        });
        
        map.on('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            
            if (touchDuration < 300 && touchStartPos) {
                // 短按 - 显示城市信息
                const touch = e.originalEvent.changedTouches[0];
                const distance = Math.sqrt(
                    Math.pow(touch.clientX - touchStartPos.x, 2) + 
                    Math.pow(touch.clientY - touchStartPos.y, 2)
                );
                
                if (distance < 10) {
                    // 点击事件
                    const latlng = map.containerPointToLatLng([
                        touch.clientX - map.getContainer().getBoundingClientRect().left,
                        touch.clientY - map.getContainer().getBoundingClientRect().top
                    ]);
                    this.createClickEffect(latlng);
                }
            }
        });
    }
    
    // 添加地图状态指示器
    addMapStatusIndicator(map) {
        const indicator = document.createElement('div');
        indicator.className = 'map-status-indicator';
        indicator.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 0.8rem 1rem;
            font-size: 0.8rem;
            color: #374151;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        `;
        
        const mapEl = document.getElementById('map');
        mapEl.style.position = 'relative';
        mapEl.appendChild(indicator);
        
        this.updateMapStats = () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            const bounds = map.getBounds();
            
            indicator.innerHTML = `
                <div style="margin-bottom: 0.3rem;">
                    <strong>📍 中心:</strong> ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}
                </div>
                <div style="margin-bottom: 0.3rem;">
                    <strong>🔍 缩放:</strong> ${zoom}
                </div>
                <div>
                    <strong>📏 范围:</strong> ${bounds.getNorthEast().lat.toFixed(2)}° - ${bounds.getSouthWest().lat.toFixed(2)}°
                </div>
            `;
        };
        
        // 初始更新
        this.updateMapStats();
    }
    
    // 显示地图帮助
    showMapHelp() {
        const help = document.createElement('div');
        help.className = 'map-help';
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
            <h3 style="margin: 0 0 1rem 0; text-align: center;">🗺️ 地图操作指南</h3>
            <div style="line-height: 1.6;">
                <div>🖱️ <strong>鼠标悬停</strong>: 查看城市预览和故事</div>
                <div>🖱️ <strong>点击标记</strong>: 查看城市详细信息</div>
                <div>🖱️ <strong>右键点击</strong>: 显示上下文菜单</div>
                <div>🖱️ <strong>双击地图</strong>: 放大到该位置</div>
                <div>⌨️ <strong>方向键</strong>: 移动地图</div>
                <div>⌨️ <strong>+/-</strong>: 缩放地图</div>
                <div>⌨️ <strong>0</strong>: 重置到中国中心</div>
                <div>⌨️ <strong>H</strong>: 显示此帮助</div>
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



    // 创建聚类图标
    createClusterIcon(cluster) {
        const childCount = cluster.getChildCount();
        let className = 'marker-cluster marker-cluster-';
        
        if (childCount < 10) {
            className += 'small';
        } else if (childCount < 100) {
            className += 'medium';
        } else {
            className += 'large';
        }
        
        return L.divIcon({
            html: `<div><span>${childCount}</span></div>`,
            className: className,
            iconSize: L.point(40, 40)
        });
    }

    // 增强地图控件 - 参考主流地图应用
    enhanceMapControls(map) {
        try {
            console.log('🔧 开始增强地图控件...');
            
            // 自定义缩放控件样式
            try {
                this.customizeZoomControl(map);
                console.log('✅ 缩放控件增强完成');
            } catch (error) {
                console.warn('⚠️ 缩放控件增强失败:', error.message);
            }
            
            // 添加全屏按钮
            try {
                this.addFullscreenControl(map);
                console.log('✅ 全屏控件添加完成');
            } catch (error) {
                console.warn('⚠️ 全屏控件添加失败:', error.message);
            }
            
            // 添加定位按钮
            try {
                this.addLocationControl(map);
                console.log('✅ 定位控件添加完成');
            } catch (error) {
                console.warn('⚠️ 定位控件添加失败:', error.message);
            }
            
            // 添加图层切换控件
            try {
                this.addLayerControl(map);
                console.log('✅ 图层切换控件添加完成');
            } catch (error) {
                console.warn('⚠️ 图层切换控件添加失败:', error.message);
            }
            
            // 添加比例尺
            try {
                this.addScaleControl(map);
                console.log('✅ 比例尺控件添加完成');
            } catch (error) {
                console.warn('⚠️ 比例尺控件添加失败:', error.message);
            }
            
            console.log('✅ 地图控件增强完成');
        } catch (error) {
            console.warn('⚠️ 地图控件增强过程中出现警告:', error.message);
            // 继续执行，不中断地图初始化
        }
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
            position: 'topleft'
        });
        
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
                background: transparent;
                border: none;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                color: white;
                text-decoration: none;
                display: block;
                transition: all 0.3s ease;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            `;
            
            const zoomOut = L.DomUtil.create('a', 'leaflet-control-zoom-out', div);
            zoomOut.innerHTML = '−';
            zoomOut.href = '#';
            zoomOut.title = '缩小';
            zoomOut.style.cssText = `
                background: transparent;
                border: none;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                color: white;
                text-decoration: none;
                display: block;
                transition: all 0.3s ease;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            `;
            
            // 悬停效果
            zoomIn.onmouseover = () => {
                zoomIn.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)';
                zoomIn.style.color = '#fff';
                zoomIn.style.transform = 'scale(1.05)';
                zoomIn.style.boxShadow = '0 0 20px rgba(255, 154, 158, 0.6)';
            };
            zoomIn.onmouseout = () => {
                zoomIn.style.background = 'transparent';
                zoomIn.style.color = 'white';
                zoomIn.style.transform = 'scale(1)';
                zoomIn.style.boxShadow = '';
            };
            
            zoomOut.onmouseover = () => {
                zoomOut.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)';
                zoomOut.style.color = '#fff';
                zoomOut.style.transform = 'scale(1.05)';
                zoomOut.style.boxShadow = '0 0 20px rgba(255, 154, 158, 0.6)';
            };
            zoomOut.onmouseout = () => {
                zoomOut.style.background = 'transparent';
                zoomOut.style.color = 'white';
                zoomOut.style.transform = 'scale(1)';
                zoomOut.style.boxShadow = '';
            };
            
            L.DomEvent.on(zoomIn, 'click', L.DomEvent.stopPropagation);
            L.DomEvent.on(zoomOut, 'click', L.DomEvent.stopPropagation);
            
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
            
            button.onclick = () => {
                const mapEl = map.getContainer();
                if (!document.fullscreenElement) {
                    mapEl.requestFullscreen().catch(err => {
                        console.log('全屏请求失败:', err);
                    });
                } else {
                    document.exitFullscreen();
                }
            };
            
            return div;
        };
        
        fullscreenControl.addTo(map);
    }

    // 添加定位控件
    addLocationControl(map) {
        const locationControl = L.control({position: 'topright'});
        locationControl.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'leaflet-control-custom');
            div.style.cssText = `
                background: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(78, 205, 196, 0.4);
                margin-top: 10px;
                border: 2px solid rgba(255, 255, 255, 0.3);
            `;
            
            const button = L.DomUtil.create('button', '', div);
            button.innerHTML = '📍';
            button.title = '定位到我的位置';
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
                button.style.background = 'linear-gradient(135deg, #6ee7df 0%, #5bc8e1 100%)';
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = '0 0 20px rgba(78, 205, 196, 0.6)';
            };
            button.onmouseout = () => {
                button.style.background = 'transparent';
                button.style.transform = 'scale(1)';
                button.style.boxShadow = '';
            };
            
            button.onclick = () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            map.setView([latitude, longitude], 12);
                            console.log(`📍 定位成功: [${latitude}, ${longitude}]`);
                        },
                        (error) => {
                            console.error('❌ 定位失败:', error);
                            alert('无法获取您的位置，请检查定位权限设置');
                        }
                    );
                } else {
                    alert('您的浏览器不支持地理定位功能');
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
            const div = L.DomUtil.create('div', 'leaflet-control-custom');
            div.style.cssText = `
                background: linear-gradient(135deg, #45b7d1 0%, #96ceb4 100%);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(69, 183, 209, 0.4);
                margin-top: 10px;
                border: 2px solid rgba(255, 255, 255, 0.3);
            `;
            
            const button = L.DomUtil.create('button', '', div);
            button.innerHTML = '🗺️';
            button.title = '切换地图样式';
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
            
            let currentLayer = 0;
            const layers = [
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
                'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png'
            ];
            
            button.onmouseover = () => {
                button.style.background = 'linear-gradient(135deg, #5bc8e1 0%, #a6e0c4 100%)';
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = '0 0 20px rgba(69, 183, 209, 0.6)';
            };
            button.onmouseout = () => {
                button.style.background = 'transparent';
                button.style.transform = 'scale(1)';
                button.style.boxShadow = '';
            };
            
            button.onclick = () => {
                currentLayer = (currentLayer + 1) % layers.length;
                map.removeLayer(map._currentTileLayer);
                
                const newLayer = L.tileLayer(layers[currentLayer], {
                    maxZoom: 18,
                    attribution: '© OpenStreetMap contributors'
                });
                
                newLayer.addTo(map);
                map._currentTileLayer = newLayer;
                
                console.log(`🗺️ 地图样式已切换: 样式 ${currentLayer + 1}`);
            };
            
            return div;
        };
        
        layerControl.addTo(map);
    }

    // 添加比例尺控件
    addScaleControl(map) {
        const scaleControl = L.control.scale({
            position: 'bottomleft',
            metric: true,
            imperial: false,
            maxWidth: 200
        });
        
        scaleControl.addTo(map);
    }

    // 添加地图交互功能
    addMapInteractionFeatures(map) {
        try {
            console.log('🔧 开始添加地图交互功能...');
            
            // 添加鼠标滚轮缩放
            if (map.scrollWheelZoom && typeof map.scrollWheelZoom.enable === 'function') {
                map.scrollWheelZoom.enable();
                console.log('✅ 鼠标滚轮缩放已启用');
            } else {
                console.warn('⚠️ 鼠标滚轮缩放功能不可用');
            }
            
            // 添加双击缩放
            if (map.doubleClickZoom && typeof map.doubleClickZoom.enable === 'function') {
                map.doubleClickZoom.enable();
                console.log('✅ 双击缩放已启用');
            } else {
                console.warn('⚠️ 双击缩放功能不可用');
            }
            
            // 添加键盘导航
            if (map.keyboard && typeof map.keyboard.enable === 'function') {
                map.keyboard.enable();
                console.log('✅ 键盘导航已启用');
            } else {
                console.warn('⚠️ 键盘导航功能不可用');
            }
            
            // 添加触摸支持
            if (map.tap && typeof map.tap.enable === 'function') {
                map.tap.enable();
                console.log('✅ 触摸支持已启用');
            } else {
                console.warn('⚠️ 触摸支持功能不可用');
            }
            
            // 添加惯性移动
            if (map.inertia && typeof map.inertia.enable === 'function') {
                map.inertia.enable();
                console.log('✅ 惯性移动已启用');
            } else {
                console.warn('⚠️ 惯性移动功能不可用');
            }
            
            // 添加世界地图边界限制
            if (typeof map.setMaxBounds === 'function') {
                map.setMaxBounds([[-90, -180], [90, 180]]);
                console.log('✅ 地图边界限制已设置');
            } else {
                console.warn('⚠️ 地图边界限制功能不可用');
            }
            
            // 添加最小缩放限制
            if (typeof map.setMinZoom === 'function') {
                map.setMinZoom(3);
                console.log('✅ 最小缩放限制已设置');
            } else {
                console.warn('⚠️ 最小缩放限制功能不可用');
            }
            
            // 添加最大缩放限制
            if (typeof map.setMaxZoom === 'function') {
                map.setMaxZoom(18);
                console.log('✅ 最大缩放限制已设置');
            } else {
                console.warn('⚠️ 最大缩放限制功能不可用');
            }
            
            console.log('✅ 地图交互功能添加完成');
        } catch (error) {
            console.warn('⚠️ 地图交互功能添加过程中出现警告:', error.message);
            // 继续执行，不中断地图初始化
        }
    }

    // 确保地图文字标签可见
    ensureMapLabelsVisibility(map) {
        try {
            console.log('🔧 开始确保地图文字标签可见...');
            
            // 等待地图完全加载后应用样式
            setTimeout(() => {
                this.applyMapLabelStyles();
            }, 1000);
            
            // 监听地图移动和缩放事件，重新应用样式
            map.on('moveend', () => {
                setTimeout(() => {
                    this.applyMapLabelStyles();
                }, 100);
            });
            
            map.on('zoomend', () => {
                setTimeout(() => {
                    this.applyMapLabelStyles();
                }, 100);
            });
            
            console.log('✅ 地图文字标签可见性设置完成');
        } catch (error) {
            console.warn('⚠️ 设置地图文字标签可见性时出现警告:', error.message);
        }
    }
    
    // 应用地图标签样式
    applyMapLabelStyles() {
        try {
            // 查找地图中的所有SVG文字元素
            const mapContainer = document.querySelector('.leaflet-container');
            if (!mapContainer) return;
            
            const textElements = mapContainer.querySelectorAll('svg text, svg tspan');
            
            textElements.forEach(text => {
                // 确保文字是黑色，带有白色描边
                text.style.fill = '#000000';
                text.style.stroke = '#ffffff';
                text.style.strokeWidth = '1px';
                text.style.fontWeight = '600';
                text.style.textShadow = '1px 1px 2px rgba(255, 255, 255, 0.8)';
                
                // 根据文字内容判断类型，应用不同的样式
                const textContent = text.textContent || '';
                if (textContent.includes('市') || textContent.includes('县')) {
                    // 城市标签
                    text.style.fontSize = '14px';
                    text.style.fontWeight = '700';
                    text.style.strokeWidth = '2px';
                    text.style.textShadow = '2px 2px 4px rgba(255, 255, 255, 0.9)';
                } else if (textContent.includes('省') || textContent.includes('自治区')) {
                    // 省级标签
                    text.style.fontSize = '16px';
                    text.style.fontWeight = '800';
                    text.style.strokeWidth = '3px';
                    text.style.textShadow = '3px 3px 6px rgba(255, 255, 255, 1)';
                }
            });
            
            console.log(`✅ 已应用样式到 ${textElements.length} 个文字元素`);
        } catch (error) {
            console.warn('⚠️ 应用地图标签样式时出现警告:', error.message);
        }
    }

    // 创建自定义标记图标
    createCustomMarker(type, index) {
        const typeInfo = this.cityTypes[type] || this.cityTypes['culture'];
        const size = 32;
        
        const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
                    </filter>
                </defs>
                <circle cx="16" cy="16" r="14" fill="${typeInfo.color}" filter="url(#shadow)"/>
                <circle cx="16" cy="16" r="12" fill="white" stroke="${typeInfo.color}" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="${typeInfo.color}">
                    ${typeInfo.icon}
                </text>
            </svg>
        `;
        
        return L.divIcon({
            html: svg,
            className: 'custom-marker',
            iconSize: [size, size],
            iconAnchor: [size/2, size],
            popupAnchor: [0, -size/2]
        });
    }

    // 获取地图实例
    getMapInstance() {
        return this.mapInstance;
    }

    // 获取所有城市数据
    getAllCityData() {
        return this.allCityData;
    }

    // 获取当前筛选类型
    getCurrentFilter() {
        return this.currentFilter;
    }

    // 检查地图是否已初始化
    isMapReady() {
        return this.isMapInitialized;
    }

    // 重新加载地图
    reloadMap() {
        if (this.mapInstance) {
            this.mapInstance.remove();
            this.mapInstance = null;
        }
        this.isMapInitialized = false;
        this.setupTravelMap();
    }

    // 手动初始化地图（供外部调用）
    async manualInit() {
        console.log('🔄 手动初始化地图...');
        try {
            await this.setupTravelMap();
        } catch (error) {
            console.error('❌ 手动初始化失败:', error);
        }
    }

    // 检查地图状态
    checkMapStatus() {
        const status = {
            domReady: document.readyState === 'complete',
            mapContainer: !!document.getElementById('map'),
            leafletLoaded: typeof L !== 'undefined',
            mapInstance: !!this.mapInstance,
            isInitialized: this.isMapInitialized
        };
        
        console.log('🗺️ 地图状态检查:', status);
        return status;
    }

    // 强制重新初始化
    forceReinit() {
        console.log('🔄 强制重新初始化地图...');
        this.cleanup();
        setTimeout(() => {
            this.setupTravelMap();
        }, 500);
    }

    // 清理资源
    cleanup() {
        if (this.mapInstance) {
            this.mapInstance.remove();
            this.mapInstance = null;
        }
        this.allMarkersGroup = null;
        this.allCityData = [];
        this.isMapInitialized = false;
        console.log('🗺️ 地图资源已清理');
    }
    
    // 检测是否使用本地服务器
    isLocalServer() {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // 检查是否是本地服务器
        return (
            protocol === 'http:' && 
            (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') &&
            (port === '' || port === '80' || port === '3000' || port === '8080' || port === '5500')
        );
    }
    
    // 获取备选城市数据（解决CORS问题）
    getFallbackCityData() {
        console.log('🔄 加载备选城市数据...');
        
        // 如果使用本地服务器，尝试再次获取JSON文件
        if (this.isLocalServer()) {
            console.log('🌐 检测到本地服务器，将尝试重新获取城市数据');
        } else {
            console.log('📁 检测到文件协议，使用内联城市数据');
        }
        
        return [
            {
                "name": "北京",
                "coords": [39.9042, 116.4074],
                "type": "culture",
                "description": "中国的首都，拥有悠久的历史文化和现代都市魅力",
                "story": "在故宫的宏伟建筑中感受历史的厚重，在长城的蜿蜒中体会民族的坚韧。漫步在胡同里，听着老北京的故事，感受这座城市的温度。",
                "photo": "images/beijing.jpg",
                "visitDate": "2023-06-15",
                "rating": 5,
                "tags": ["历史", "文化", "古都", "现代"]
            },
            {
                "name": "上海",
                "coords": [31.2304, 121.4737],
                "type": "adventure",
                "description": "国际化大都市，融合东西方文化的现代魔都",
                "story": "外滩的夜景让人沉醉，黄浦江的波光粼粼诉说着这座城市的繁华。在陆家嘴的摩天大楼间穿梭，感受现代都市的脉搏。",
                "photo": "images/shanghai.jpg",
                "visitDate": "2023-08-20",
                "rating": 5,
                "tags": ["现代", "繁华", "国际化", "夜景"]
            },
            {
                "name": "西安",
                "coords": [34.2655, 108.9508],
                "type": "culture",
                "description": "古都长安，丝绸之路的起点，中华文明的发源地",
                "story": "兵马俑的壮观让人震撼，古城墙的厚重诉说着历史的沧桑。在大雁塔下聆听古钟声，感受千年古都的韵味。",
                "photo": "images/xian.jpg",
                "visitDate": "2023-05-10",
                "rating": 5,
                "tags": ["古都", "历史", "文化", "兵马俑"]
            },
            {
                "name": "成都",
                "coords": [30.5728, 104.0668],
                "type": "food",
                "description": "天府之国，美食之都，悠闲生活的代表",
                "story": "宽窄巷子里飘着火锅的香气，锦里古街上传来川剧的悠扬。在春熙路感受现代成都的活力，在都江堰体会古人的智慧。",
                "photo": "images/chengdu.jpg",
                "visitDate": "2023-07-15",
                "rating": 5,
                "tags": ["美食", "悠闲", "文化", "熊猫"]
            },
            {
                "name": "杭州",
                "coords": [30.2741, 120.1551],
                "type": "nature",
                "description": "人间天堂，西湖美景，诗意江南的代表",
                "story": "西湖的烟波浩渺让人心醉，雷峰塔的传说让人神往。在灵隐寺感受禅意，在龙井茶园品味茶香。",
                "photo": "images/hangzhou.jpg",
                "visitDate": "2023-09-20",
                "rating": 5,
                "tags": ["西湖", "诗意", "江南", "茶文化"]
            },
            {
                "name": "桂林",
                "coords": [25.2744, 110.2993],
                "type": "nature",
                "description": "山水甲天下，喀斯特地貌的奇观",
                "story": "漓江的山水如画，阳朔的田园如诗。在象鼻山前拍照留念，在遇龙河上泛舟赏景。",
                "photo": "images/guilin.jpg",
                "visitDate": "2023-04-25",
                "rating": 5,
                "tags": ["山水", "喀斯特", "田园", "漓江"]
            },
            {
                "name": "丽江",
                "coords": [26.8721, 100.2299],
                "type": "culture",
                "description": "古城丽江，纳西文化的瑰宝，高原上的明珠",
                "story": "古城的小桥流水让人流连，玉龙雪山的巍峨让人震撼。在四方街感受纳西风情，在束河古镇体验慢生活。",
                "photo": "images/lijiang.jpg",
                "visitDate": "2023-10-15",
                "rating": 5,
                "tags": ["古城", "纳西文化", "高原", "雪山"]
            },
            {
                "name": "三亚",
                "coords": [18.2528, 109.5119],
                "type": "nature",
                "description": "热带海滨城市，阳光沙滩，度假天堂",
                "story": "亚龙湾的碧海蓝天让人心旷神怡，天涯海角的浪漫让人向往。在蜈支洲岛潜水，在南山寺祈福。",
                "photo": "images/sanya.jpg",
                "visitDate": "2023-11-30",
                "rating": 5,
                "tags": ["海滨", "热带", "度假", "阳光"]
            },
            {
                "name": "青岛",
                "coords": [36.0671, 120.3826],
                "type": "food",
                "description": "海滨城市，啤酒之都，德式建筑风情",
                "story": "栈桥的海风让人清爽，八大关的建筑让人着迷。在啤酒博物馆品尝原浆，在崂山感受道教文化。",
                "photo": "images/qingdao.jpg",
                "visitDate": "2023-06-20",
                "rating": 4,
                "tags": ["海滨", "啤酒", "德式建筑", "崂山"]
            },
            {
                "name": "厦门",
                "coords": [24.4798, 118.0894],
                "type": "culture",
                "description": "海上花园，文艺小城，闽南文化的代表",
                "story": "鼓浪屿的钢琴声让人陶醉，环岛路的风景让人心旷神怡。在曾厝垵感受文艺气息，在南普陀寺祈福。",
                "photo": "images/xiamen.jpg",
                "visitDate": "2023-08-10",
                "rating": 4,
                "tags": ["海岛", "文艺", "闽南文化", "钢琴"]
            }
        ];
    }
}
