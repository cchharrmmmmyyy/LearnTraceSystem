/**
 * API 服务模块
 * 功能：封装所有与后端交互的接口，支持数据同步到服务器
 * 更新日期：2026-03-24
 */

class ApiService {
    constructor() {
        this.baseURL = AppConfig.api?.baseURL || '';
        this.timeout = AppConfig.api?.timeout || 10000;
    }

    /**
     * 发起请求
     * @param {string} url - 请求URL
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>}
     */
    async request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            console.error(`[ApiService] 请求失败 [${options.method || 'GET'} ${url}]:`, error);
            throw error;
        }
    }

    /**
     * GET 请求
     * @param {string} url
     * @param {Object} params - 查询参数
     * @returns {Promise<Object>}
     */
    async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request(fullUrl, { method: 'GET' });
    }

    /**
     * POST 请求
     * @param {string} url
     * @param {Object} data - 请求体数据
     * @returns {Promise<Object>}
     */
    async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT 请求
     * @param {string} url
     * @param {Object} data - 请求体数据
     * @returns {Promise<Object>}
     */
    async put(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE 请求
     * @param {string} url
     * @returns {Promise<Object>}
     */
    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    }

    getFullUrl(path) {
        return this.baseURL + path;
    }

    async saveHoverData(sessionId, hoverData) {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址，跳过保存');
            return null;
        }

        try {
            const response = await this.post(this.getFullUrl('/api/hover-data'), {
                session_id: sessionId,
                data: hoverData,
                timestamp: new Date().toISOString()
            });
            console.log('[ApiService] 悬停数据已保存到服务器');
            return response;
        } catch (error) {
            console.error('[ApiService] 保存悬停数据失败:', error);
            return null;
        }
    }

    async collectBehaviorData(sessionId, events) {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址，跳过采集');
            return null;
        }

        try {
            const url = `${this.getFullUrl('/api/behavior/collect')}?sessionId=${encodeURIComponent(sessionId)}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(events)
            });
            const result = await response.json();
            console.log('[ApiService] 行为数据已采集到服务器');
            return result;
        } catch (error) {
            console.error('[ApiService] 采集行为数据失败:', error);
            return null;
        }
    }

    async getHoverData(sessionId) {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址');
            return null;
        }

        try {
            const response = await this.get(this.getFullUrl(`/api/hover-data/${sessionId}`));
            return response;
        } catch (error) {
            console.error('[ApiService] 获取悬停数据失败:', error);
            return null;
        }
    }

    async getDefaultArticle() {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址');
            return null;
        }

        try {
            const response = await this.get(this.getFullUrl('/api/articles/default'));
            return response;
        } catch (error) {
            console.error('[ApiService] 获取默认文章失败:', error);
            return null;
        }
    }

    async deleteHoverData(sessionId) {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址');
            return null;
        }

        try {
            const response = await this.delete(this.getFullUrl(`/api/hover-data/${sessionId}`));
            console.log('[ApiService] 悬停数据已从服务器删除');
            return response;
        } catch (error) {
            console.error('[ApiService] 删除悬停数据失败:', error);
            return null;
        }
    }

    async saveSession(sessionData) {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址，跳过保存');
            return null;
        }

        try {
            const response = await this.post(this.getFullUrl('/api/sessions'), sessionData);
            console.log('[ApiService] 会话数据已保存到服务器');
            return response;
        } catch (error) {
            console.error('[ApiService] 保存会话数据失败:', error);
            return null;
        }
    }

    async getSessions() {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址');
            return null;
        }

        try {
            const response = await this.get(this.getFullUrl('/api/sessions'));
            return response;
        } catch (error) {
            console.error('[ApiService] 获取会话列表失败:', error);
            return null;
        }
    }

    async getSession(sessionId) {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址');
            return null;
        }

        try {
            const response = await this.get(this.getFullUrl(`/api/sessions/${sessionId}`));
            return response;
        } catch (error) {
            console.error('[ApiService] 获取会话详情失败:', error);
            return null;
        }
    }

    async deleteSession(sessionId) {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址');
            return null;
        }

        try {
            const response = await this.delete(this.getFullUrl(`/api/sessions/${sessionId}`));
            console.log('[ApiService] 会话已从服务器删除');
            return response;
        } catch (error) {
            console.error('[ApiService] 删除会话失败:', error);
            return null;
        }
    }

    async exportHoverData(sessionId) {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址');
            return;
        }

        try {
            const response = await fetch(this.getFullUrl(`/api/export/hover-data/${sessionId}`));
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hover_data_${sessionId}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('[ApiService] 数据已从服务器导出');
        } catch (error) {
            console.error('[ApiService] 导出数据失败:', error);
        }
    }

    async saveUserData(userData) {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址，跳过保存');
            return null;
        }

        try {
            const response = await this.post(this.getFullUrl('/api/users'), userData);
            console.log('[ApiService] 用户数据已保存到服务器');
            return response;
        } catch (error) {
            console.error('[ApiService] 保存用户数据失败:', error);
            return null;
        }
    }

    async getUserData(userId) {
        if (!this.baseURL) {
            console.warn('[ApiService] 未配置后端API地址');
            return null;
        }

        try {
            const response = await this.get(this.getFullUrl(`/api/users/${userId}`));
            return response;
        } catch (error) {
            console.error('[ApiService] 获取用户数据失败:', error);
            return null;
        }
    }
}

const apiService = new ApiService();
window.apiService = apiService;
