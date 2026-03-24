/**
 * 数据存储模块
 * 功能：管理 localStorage 操作，包括会话数据、用户数据、采集数据等
 * 更新日期：2026-03-24
 */

class DataStorage {
    constructor() {
        this.storageKeys = AppConfig.storage.keys;
        this.maxSessions = AppConfig.storage.maxSessions;
    }

    /**
     * 检查是否启用后端同步
     * @returns {boolean}
     */
    isSyncEnabled() {
        return AppConfig.api?.enableSync && AppConfig.api?.baseURL;
    }

    /**
     * 同步数据到后端
     * @param {string} type - 数据类型
     * @param {string} sessionId - 会话ID
     * @param {Object} data - 数据
     */
    async syncToBackend(type, sessionId, data) {
        if (!this.isSyncEnabled()) {
            return;
        }

        try {
            if (type === 'hover') {
                await apiService.collectBehaviorData(sessionId, data);
            } else if (type === 'session') {
                await apiService.saveSession(data);
            }
        } catch (error) {
            console.error(`[DataStorage] 同步${type}数据到后端失败:`, error);
        }
    }

    /**
     * 生成唯一会话ID
     * @returns {string}
     */
    generateSessionId() {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 9);
        return `session_${timestamp}_${randomStr}`;
    }

    /**
     * 保存数据到 localStorage
     * @param {string} key
     * @param {any} data
     */
    setItem(key, data) {
        try {
            const jsonStr = JSON.stringify(data);
            localStorage.setItem(key, jsonStr);
            return true;
        } catch (error) {
            console.error(`[DataStorage] 保存数据失败 [${key}]:`, error);
            return false;
        }
    }

    /**
     * 从 localStorage 获取数据
     * @param {string} key
     * @returns {any}
     */
    getItem(key) {
        try {
            const jsonStr = localStorage.getItem(key);
            return jsonStr ? JSON.parse(jsonStr) : null;
        } catch (error) {
            console.error(`[DataStorage] 获取数据失败 [${key}]:`, error);
            return null;
        }
    }

    /**
     * 删除 localStorage 中的数据
     * @param {string} key
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`[DataStorage] 删除数据失败 [${key}]:`, error);
            return false;
        }
    }

    /**
     * 保存阅读会话数据
     * @param {Object} sessionData
     */
    saveSession(sessionData) {
        const sessions = this.getItem(this.storageKeys.readingSessions) || [];
        sessions.push(sessionData);

        if (sessions.length > this.maxSessions) {
            sessions.shift();
        }

        const result = this.setItem(this.storageKeys.readingSessions, sessions);
        this.syncToBackend('session', sessionData.session_id || sessionData.date, sessionData);
        return result;
    }

    /**
     * 获取所有阅读会话
     * @returns {Array}
     */
    getSessions() {
        return this.getItem(this.storageKeys.readingSessions) || [];
    }

    /**
     * 清除所有阅读会话
     */
    clearSessions() {
        return this.removeItem(this.storageKeys.readingSessions);
    }

    /**
     * 保存用户数据
     * @param {Object} userData
     */
    saveUserData(userData) {
        return this.setItem(this.storageKeys.userData, userData);
    }

    /**
     * 获取用户数据
     * @returns {Object|null}
     */
    getUserData() {
        return this.getItem(this.storageKeys.userData);
    }

    /**
     * 清除用户数据
     */
    clearUserData() {
        return this.removeItem(this.storageKeys.userData);
    }

    /**
     * 保存悬停采集数据
     * @param {Object} hoverData
     */
    saveHoverData(hoverData) {
        return this.setItem(this.storageKeys.hoverData, hoverData);
    }

    /**
     * 获取悬停采集存储结构
     * @returns {Object}
     */
    getHoverStore() {
        const stored = this.getItem(this.storageKeys.hoverData);
        if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
            return {
                currentSessionId: stored.currentSessionId || null,
                sessions: stored.sessions || {}
            };
        }

        return {
            currentSessionId: null,
            sessions: {}
        };
    }

    /**
     * 获取悬停采集数据（兼容旧接口）
     * @returns {Array}
     */
    getHoverData() {
        const store = this.getHoverStore();
        return Object.values(store.sessions).flatMap(session => session.data || []);
    }

    /**
     * 创建或切换当前悬停采集会话
     * @param {string} sessionId
     */
    startHoverSession(sessionId) {
        const store = this.getHoverStore();
        const now = new Date().toISOString();

        if (!store.sessions[sessionId]) {
            store.sessions[sessionId] = {
                session_id: sessionId,
                created_at: now,
                updated_at: now,
                data: []
            };
        }

        store.currentSessionId = sessionId;
        store.sessions[sessionId].updated_at = now;
        return this.saveHoverData(store);
    }

    /**
     * 获取指定会话的悬停数据
     * @param {string} sessionId
     * @returns {Array}
     */
    getSessionHoverData(sessionId) {
        const store = this.getHoverStore();
        return store.sessions[sessionId]?.data || [];
    }

    /**
     * 添加单条悬停数据
     * @param {string} sessionId
     * @param {Object} hoverRecord
     */
    addHoverRecord(sessionId, hoverRecord) {
        const store = this.getHoverStore();
        const now = new Date().toISOString();

        if (!store.sessions[sessionId]) {
            store.sessions[sessionId] = {
                session_id: sessionId,
                created_at: now,
                updated_at: now,
                data: []
            };
        }

        store.currentSessionId = sessionId;
        store.sessions[sessionId].updated_at = now;
        store.sessions[sessionId].data.push(hoverRecord);
        const result = this.saveHoverData(store);
        this.syncToBackend('hover', sessionId, [hoverRecord]);
        return result;
    }

    /**
     * 清除指定会话的悬停数据
     * @param {string} sessionId
     */
    clearHoverSession(sessionId) {
        const store = this.getHoverStore();

        if (store.sessions[sessionId]) {
            delete store.sessions[sessionId];
        }

        if (store.currentSessionId === sessionId) {
            store.currentSessionId = null;
        }

        return this.saveHoverData(store);
    }

    /**
     * 清除悬停数据
     */
    clearHoverData() {
        return this.removeItem(this.storageKeys.hoverData);
    }

    /**
     * 导出数据为 JSON 文件
     * @param {string} filename
     */
    exportToJson(filename = 'learntrace_data.json') {
        const data = {
            exportTime: new Date().toISOString(),
            sessions: this.getSessions(),
            hoverData: this.getHoverData()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * 清除所有应用数据
     */
    clearAll() {
        Object.values(this.storageKeys).forEach(key => {
            this.removeItem(key);
        });
    }
}

const dataStorage = new DataStorage();
window.dataStorage = dataStorage;
