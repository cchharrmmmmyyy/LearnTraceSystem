/**
 * 组件加载器
 * 功能：动态加载HTML组件（navbar、footer等）
 * 更新日期：2026-03-24
 */

class ComponentLoader {
    constructor() {
        this.componentsPath = AppConfig.paths.components;
        this.loadedComponents = new Map();
    }

    /**
     * 加载单个组件
     * @param {string} componentName - 组件名称
     * @param {HTMLElement} targetElement - 目标DOM元素
     * @returns {Promise<boolean>}
     */
    async loadComponent(componentName, targetElement) {
        if (!targetElement) {
            console.error(`[ComponentLoader] 目标元素不存在: ${componentName}`);
            return false;
        }

        const cacheKey = `${componentName}-${Date.now()}`;
        const componentPath = `${this.componentsPath}${componentName}.html`;

        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            targetElement.innerHTML = html;
            this.loadedComponents.set(cacheKey, { name: componentName, html });

            this.initializeComponent(componentName);
            console.log(`[ComponentLoader] 组件加载成功: ${componentName}`);
            return true;
        } catch (error) {
            console.error(`[ComponentLoader] 组件加载失败 [${componentName}]:`, error);
            return false;
        }
    }

    /**
     * 初始化组件特定逻辑
     * @param {string} componentName
     */
    initializeComponent(componentName) {
        switch (componentName) {
            case 'navbar':
                this.setupNavbar();
                break;
            case 'footer-info':
                this.setupFooter();
                break;
        }
    }

    /**
     * 设置导航栏高亮
     */
    setupNavbar() {
        const currentPage = this.getCurrentPage();
        const navLinks = document.querySelectorAll('.nav-link[data-page]');

        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === currentPage) {
                link.classList.add('nav-link--active');
            } else {
                link.classList.remove('nav-link--active');
            }
        });
    }

    /**
     * 设置页脚
     */
    setupFooter() {
        const versionSpan = document.querySelector('.footer-info__version');
        if (versionSpan) {
            versionSpan.textContent = `${AppConfig.texts.footer.version} ${AppConfig.app.version}`;
        }
    }

    /**
     * 获取当前页面标识
     * @returns {string}
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';

        if (filename.startsWith('index')) return 'index';
        if (filename.startsWith('analytic')) return 'analytics';
        return '';
    }

    /**
     * 加载导航栏
     * @param {HTMLElement} targetElement
     * @returns {Promise<boolean>}
     */
    loadNavbar(targetElement) {
        return this.loadComponent('navbar', targetElement);
    }

    /**
     * 加载页脚信息
     * @param {HTMLElement} targetElement
     * @returns {Promise<boolean>}
     */
    loadFooterInfo(targetElement) {
        return this.loadComponent('footer-info', targetElement);
    }

    /**
     * 获取已加载的组件
     * @returns {Map}
     */
    getLoadedComponents() {
        return this.loadedComponents;
    }
}

/**
 * 加载组件的便捷函数
 * @param {string} componentName
 * @param {string} targetId
 * @returns {Promise<boolean>}
 */
function loadComponent(componentName, targetId) {
    const target = document.getElementById(targetId);
    if (!target) {
        console.error(`[loadComponent] 未找到目标元素: #${targetId}`);
        return Promise.resolve(false);
    }

    const loader = window.app?.componentLoader;
    if (!loader) {
        console.error('[loadComponent] App 未初始化');
        return Promise.resolve(false);
    }

    return loader.loadComponent(componentName, target);
}
