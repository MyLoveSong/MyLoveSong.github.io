// 主题管理器类
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
    }

    // 日夜模式切换
    setupTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        
        // 应用保存的主题
        this.applyTheme();
        
        themeToggle.addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme();
            localStorage.setItem('theme', this.currentTheme);
            
            // 添加切换动画效果
            this.addThemeTransitionEffect();
        });
    }

    applyTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');
        
        if (this.currentTheme === 'dark') {
            body.classList.add('dark-theme');
            themeIcon.textContent = '🌙';
            // 更新页面标题以反映当前主题
            document.documentElement.setAttribute('data-theme', 'dark');
            // 强制应用暗黑模式样式
            this.applyDarkThemeStyles();
        } else {
            body.classList.remove('dark-theme');
            themeIcon.textContent = '☀️';
            document.documentElement.setAttribute('data-theme', 'light');
            // 强制应用浅色模式样式
            this.applyLightThemeStyles();
        }
    }

    // 添加主题切换过渡效果
    addThemeTransitionEffect() {
        const body = document.body;
        
        // 添加过渡类
        body.classList.add('theme-transitioning');
        
        // 强制应用主题样式到所有文本元素
        this.forceApplyThemeStyles();
        
        // 300ms后移除过渡类
        setTimeout(() => {
            body.classList.remove('theme-transitioning');
        }, 300);
    }

    // 强制应用主题样式到所有文本元素
    forceApplyThemeStyles() {
        if (this.currentTheme === 'dark') {
            // 强制应用暗黑模式样式
            this.applyDarkThemeStyles();
        } else {
            // 强制应用浅色模式样式
            this.applyLightThemeStyles();
        }
    }

    // 强制应用暗黑模式样式
    applyDarkThemeStyles() {
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, span, div, article, section');
        const cardElements = document.querySelectorAll('.card, article, .case-study, .features-list li, .team-member, .testimonial-card, blockquote');
        
        // 应用文本颜色
        textElements.forEach(element => {
            if (element.tagName.match(/^H[1-6]$/)) {
                element.style.color = '#ffffff';
            } else if (element.tagName === 'STRONG' || element.tagName === 'B' || element.tagName === 'EM') {
                element.style.color = '#74b9ff';
            } else if (element.tagName === 'A') {
                element.style.color = '#74b9ff';
            } else if (element.tagName === 'P' || element.tagName === 'LI' || element.tagName === 'TD' || element.tagName === 'TH') {
                element.style.color = '#e0e0e0';
            } else if (element.tagName === 'SPAN' && element.classList.contains('highlight')) {
                element.style.color = '#fdcb6e';
            } else if (element.tagName === 'DIV' && element.classList.contains('content')) {
                element.style.color = '#e0e0e0';
            } else if (element.tagName === 'ARTICLE' || element.tagName === 'SECTION') {
                element.style.color = '#e0e0e0';
            }
        });
        
        // 应用卡片背景颜色
        cardElements.forEach(element => {
            if (element.classList.contains('card')) {
                element.style.backgroundColor = 'rgba(45, 55, 72, 0.8)';
                element.style.borderColor = '#4a5568';
            } else if (element.classList.contains('case-study')) {
                element.style.backgroundColor = 'rgba(45, 55, 72, 0.6)';
                element.style.borderColor = '#4a5568';
            } else if (element.classList.contains('team-member')) {
                element.style.backgroundColor = 'rgba(45, 55, 72, 0.7)';
                element.style.borderColor = '#4a5568';
            } else if (element.classList.contains('testimonial-card')) {
                element.style.backgroundColor = 'rgba(45, 55, 72, 0.8)';
                element.style.borderColor = '#4a5568';
            } else if (element.tagName === 'BLOCKQUOTE') {
                element.style.backgroundColor = 'rgba(45, 55, 72, 0.5)';
                element.style.borderLeftColor = '#74b9ff';
            } else {
                element.style.backgroundColor = 'rgba(45, 55, 72, 0.3)';
                element.style.borderColor = '#4a5568';
            }
        });
        
        // 特殊处理导航栏
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.backgroundColor = 'rgba(26, 32, 44, 0.95)';
            nav.style.borderBottomColor = '#4a5568';
        }
        
        // 特殊处理页脚
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.backgroundColor = 'rgba(26, 32, 44, 0.9)';
            footer.style.borderTopColor = '#4a5568';
        }
        
        // 特殊处理按钮
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            if (button.classList.contains('btn-primary')) {
                button.style.backgroundColor = '#74b9ff';
                button.style.borderColor = '#74b9ff';
                button.style.color = '#ffffff';
            } else if (button.classList.contains('btn-secondary')) {
                button.style.backgroundColor = 'transparent';
                button.style.borderColor = '#74b9ff';
                button.style.color = '#74b9ff';
            } else {
                button.style.backgroundColor = 'rgba(45, 55, 72, 0.8)';
                button.style.borderColor = '#4a5568';
                button.style.color = '#e0e0e0';
            }
        });
        
        // 特殊处理输入框
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.style.backgroundColor = 'rgba(45, 55, 72, 0.8)';
            input.style.borderColor = '#4a5568';
            input.style.color = '#e0e0e0';
        });
        
        // 特殊处理表格
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            table.style.backgroundColor = 'rgba(45, 55, 72, 0.5)';
            table.style.borderColor = '#4a5568';
        });
        
        const tableCells = document.querySelectorAll('td, th');
        tableCells.forEach(cell => {
            cell.style.borderColor = '#4a5568';
            cell.style.color = '#e0e0e0';
        });
    }

    // 强制应用浅色模式样式
    applyLightThemeStyles() {
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, span, div, article, section');
        const cardElements = document.querySelectorAll('.card, article, .case-study, .features-list li, .team-member, .testimonial-card, blockquote');
        
        // 恢复文本颜色
        textElements.forEach(element => {
            element.style.color = '';
        });
        
        // 恢复背景颜色
        cardElements.forEach(element => {
            element.style.backgroundColor = '';
            element.style.borderColor = '';
        });
        
        // 恢复导航栏
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.backgroundColor = '';
            nav.style.borderBottomColor = '';
        }
        
        // 恢复页脚
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.backgroundColor = '';
            footer.style.borderTopColor = '';
        }
        
        // 恢复按钮
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            button.style.backgroundColor = '';
            button.style.borderColor = '';
            button.style.color = '';
        });
        
        // 恢复输入框
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.style.backgroundColor = '';
            input.style.borderColor = '';
            input.style.color = '';
        });
        
        // 恢复表格
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            table.style.backgroundColor = '';
            table.style.borderColor = '';
        });
        
        const tableCells = document.querySelectorAll('td, th');
        tableCells.forEach(cell => {
            cell.style.borderColor = '';
            cell.style.color = '';
        });
    }
}
