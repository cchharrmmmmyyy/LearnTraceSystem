class AdminManager {
    constructor() {
        this.currentUser = null;
        this.sessionData = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
    }

    loadUserData() {
        const userData = localStorage.getItem('adminUserData');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('adminUserData', JSON.stringify(this.currentUser));
        }
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUI();
        });
    }

    updateUI() {
        const navAvatar = document.querySelector('.nav-avatar');
        if (navAvatar && this.currentUser) {
            navAvatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        this.saveUserData();
        this.updateUI();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('adminUserData');
        this.updateUI();
    }

    saveSessionData(sessionData) {
        this.sessionData.push(sessionData);
        const savedSessions = localStorage.getItem('readingSessions');
        const sessions = savedSessions ? JSON.parse(savedSessions) : [];
        sessions.push(sessionData);
        localStorage.setItem('readingSessions', JSON.stringify(sessions));
    }

    getSessionData() {
        const savedSessions = localStorage.getItem('readingSessions');
        return savedSessions ? JSON.parse(savedSessions) : [];
    }

    clearSessionData() {
        this.sessionData = [];
        localStorage.removeItem('readingSessions');
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 16px 24px;
            background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

const adminManager = new AdminManager();
