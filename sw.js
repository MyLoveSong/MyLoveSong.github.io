/**
 * Service Worker for Blog System
 * 提供离线缓存和性能优化
 */

const CACHE_NAME = 'blog-system-v1.0.0';
const STATIC_CACHE = 'blog-static-v1.0.0';
const DYNAMIC_CACHE = 'blog-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/blog.html',
    '/css/base.css',
    '/css/layout.css',
    '/css/typography.css',
    '/css/blog.css',
    '/css/main.css',
    '/js/blog-system.js',
    '/js/map-manager.js',
    '/js/music-website-core.js',
    '/images/logo.png',
    '/images/logo.ico',
    '/posts/welcome.md',
    '/posts/web-development.md',
    '/posts/travel-map.md'
];

// 需要缓存的动态资源
const DYNAMIC_ASSETS = [
    'https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js',
    'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/highlight.min.js',
    'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css'
];

// 安装事件
self.addEventListener('install', event => {
    console.log('🔧 Service Worker 安装中...');
    
    event.waitUntil(
        Promise.all([
            // 缓存静态资源
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 缓存静态资源...');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // 缓存动态资源
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('🌐 缓存动态资源...');
                return cache.addAll(DYNAMIC_ASSETS);
            })
        ]).then(() => {
            console.log('✅ Service Worker 安装完成');
            // 立即激活新的Service Worker
            return self.skipWaiting();
        })
    );
});

// 激活事件
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker 激活中...');
    
    event.waitUntil(
        Promise.all([
            // 清理旧缓存
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ 删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // 立即控制所有客户端
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker 激活完成');
        })
    );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 只处理GET请求
    if (request.method !== 'GET') {
        return;
    }
    
    // 处理不同类型的请求
    if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isMarkdownFile(request)) {
        event.respondWith(handleMarkdownFile(request));
    } else if (isExternalResource(request)) {
        event.respondWith(handleExternalResource(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

// 判断是否为静态资源
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

// 判断是否为Markdown文件
function isMarkdownFile(request) {
    const url = new URL(request.url);
    return url.pathname.endsWith('.md');
}

// 判断是否为外部资源
function isExternalResource(request) {
    const url = new URL(request.url);
    return url.origin !== location.origin;
}

// 处理静态资源
async function handleStaticAsset(request) {
    try {
        // 首先尝试从缓存获取
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 如果缓存中没有，从网络获取
        const networkResponse = await fetch(request);
        
        // 将响应添加到缓存
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('静态资源获取失败:', error);
        return new Response('资源加载失败', { status: 404 });
    }
}

// 处理Markdown文件
async function handleMarkdownFile(request) {
    try {
        // 首先尝试从缓存获取
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 从网络获取
        const networkResponse = await fetch(request);
        
        // 将响应添加到动态缓存
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Markdown文件获取失败:', error);
        
        // 返回离线页面或错误信息
        return new Response(
            `# 离线模式\n\n很抱歉，您当前处于离线状态，无法加载此文章。\n\n请检查网络连接后重试。`,
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/markdown; charset=utf-8'
                }
            }
        );
    }
}

// 处理外部资源
async function handleExternalResource(request) {
    try {
        // 首先尝试从缓存获取
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 从网络获取
        const networkResponse = await fetch(request);
        
        // 将响应添加到动态缓存
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('外部资源获取失败:', error);
        
        // 对于CDN资源，返回一个基本的替代方案
        if (request.url.includes('marked.min.js')) {
            return new Response('// Markdown解析器离线模式', {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }
        
        if (request.url.includes('highlight.min.js')) {
            return new Response('// 代码高亮离线模式', {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }
        
        return new Response('资源加载失败', { status: 404 });
    }
}

// 处理动态请求
async function handleDynamicRequest(request) {
    try {
        // 网络优先策略
        const networkResponse = await fetch(request);
        
        // 将响应添加到动态缓存
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('动态请求失败:', error);
        
        // 尝试从缓存获取
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 返回离线页面
        return new Response(
            `<!DOCTYPE html>
            <html>
            <head>
                <title>离线模式</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline-message { max-width: 500px; margin: 0 auto; }
                </style>
            </head>
            <body>
                <div class="offline-message">
                    <h1>🔌 离线模式</h1>
                    <p>您当前处于离线状态，无法访问此页面。</p>
                    <p>请检查网络连接后重试。</p>
                    <button onclick="location.reload()">重新加载</button>
                </div>
            </body>
            </html>`,
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8'
                }
            }
        );
    }
}

// 后台同步
self.addEventListener('sync', event => {
    console.log('🔄 后台同步:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// 执行后台同步
async function doBackgroundSync() {
    try {
        // 更新缓存
        await updateCache();
        console.log('✅ 后台同步完成');
    } catch (error) {
        console.error('❌ 后台同步失败:', error);
    }
}

// 更新缓存
async function updateCache() {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    // 更新Markdown文件
    const markdownFiles = [
        '/posts/welcome.md',
        '/posts/web-development.md',
        '/posts/travel-map.md'
    ];
    
    for (const file of markdownFiles) {
        try {
            const response = await fetch(file);
            if (response.ok) {
                await cache.put(file, response);
            }
        } catch (error) {
            console.warn('更新文件失败:', file, error);
        }
    }
}

// 推送通知
self.addEventListener('push', event => {
    console.log('📱 收到推送通知:', event);
    
    const options = {
        body: event.data ? event.data.text() : '您有新的博客文章更新！',
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '查看博客',
                icon: '/images/logo.png'
            },
            {
                action: 'close',
                title: '关闭',
                icon: '/images/logo.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('博客系统', options)
    );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
    console.log('🔔 通知被点击:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/blog.html')
        );
    }
});

// 消息处理
self.addEventListener('message', event => {
    console.log('💬 收到消息:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// 错误处理
self.addEventListener('error', event => {
    console.error('❌ Service Worker 错误:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('❌ Service Worker Promise 拒绝:', event.reason);
});

console.log('🎉 Service Worker 脚本加载完成');
