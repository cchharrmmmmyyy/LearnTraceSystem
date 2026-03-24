/**
 * Admin 管理模块
 * 功能：管理用户数据、阅读会话数据、通知等
 * 更新日期：2026-03-24
 */

class AdminManager {
    constructor() {
        this.currentUser = null;
        this.sessionData = [];
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
    }

    /**
     * 加载用户数据
     */
    loadUserData() {
        const userData = dataStorage.getUserData();
        if (userData) {
            this.currentUser = userData;
        }
    }

    /**
     * 保存用户数据
     */
    saveUserData() {
        if (this.currentUser) {
            dataStorage.saveUserData(this.currentUser);
        }
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUI();
        });
    }

    /**
     * 更新UI
     */
    updateUI() {
        const navAvatar = document.querySelector('.nav-avatar');
        if (navAvatar && this.currentUser) {
            navAvatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
        }
    }

    /**
     * 获取当前用户
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 设置当前用户
     * @param {Object} user
     */
    setCurrentUser(user) {
        this.currentUser = user;
        this.saveUserData();
        this.updateUI();
    }

    /**
     * 退出登录
     */
    logout() {
        this.currentUser = null;
        dataStorage.clearUserData();
        this.updateUI();
    }

    /**
     * 保存会话数据
     * @param {Object} sessionData
     */
    saveSessionData(sessionData) {
        this.sessionData.push(sessionData);
        dataStorage.saveSession(sessionData);
    }

    /**
     * 获取所有会话数据
     * @returns {Array}
     */
    getSessionData() {
        return dataStorage.getSessions();
    }

    /**
     * 清除会话数据
     */
    clearSessionData() {
        this.sessionData = [];
        dataStorage.clearSessions();
    }

    /**
     * 格式化时间
     * @param {number} seconds
     * @returns {string}
     */
    formatTime(seconds) {
        return Utils.formatTime(seconds);
    }

    /**
     * 显示通知
     * @param {string} message
     * @param {string} type - success | error | warning
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;

        const colors = {
            success: AppConfig.colors.status.success,
            error: AppConfig.colors.status.error,
            warning: AppConfig.colors.status.warning
        };

        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 16px 24px;
            background-color: ${colors[type] || colors.success};
            color: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            z-index: var(--z-notification);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

const adminManager = new AdminManager();
