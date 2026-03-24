/**
 * App 主模块
 * 功能：应用入口，协调各模块初始化
 * 更新日期：2026-03-24
 */

class App {
    constructor() {
        this.componentLoader = null;
        this.isInitialized = false;
    }

    /**
     * 初始化应用
     */
    async init() {
        if (this.isInitialized) {
            console.warn('[App] 应用已初始化，跳过');
            return;
        }

        console.log('[App] 开始初始化...');

        this.componentLoader = new ComponentLoader();
        await this.loadComponents();
        this.setupGlobalEventListeners();

        this.isInitialized = true;
        console.log('[App] 应用初始化完成');
    }

    /**
     * 加载公共组件
     */
    async loadComponents() {
        const navbarTarget = document.getElementById('navbar-container');
        const footerTarget = document.getElementById('footer-container');

        if (navbarTarget) {
            await this.componentLoader.loadNavbar(navbarTarget);
        }

        if (footerTarget) {
            await this.componentLoader.loadFooterInfo(footerTarget);
        }
    }

    /**
     * 设置全局事件监听
     */
    setupGlobalEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                const href = e.target.getAttribute('href');
                if (href && !href.startsWith('#')) {
                    setTimeout(() => {
                        this.componentLoader?.setupNavbar();
                    }, 100);
                }
            }
        });
    }

    /**
     * 获取组件加载器
     * @returns {ComponentLoader}
     */
    getComponentLoader() {
        return this.componentLoader;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});
