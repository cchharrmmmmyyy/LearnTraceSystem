/**
 * 工具函数模块
 * 功能：提供通用的工具函数
 * 更新日期：2026-03-24
 */

const Utils = {
    /**
     * 格式化时间（秒 -> MM:SS 或 HH:MM:SS）
     * @param {number} seconds - 秒数
     * @param {boolean} showHours - 是否显示小时
     * @returns {string}
     */
    formatTime(seconds, showHours = false) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const pad = (num) => String(num).padStart(2, '0');

        if (showHours && hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
        }
        return `${pad(minutes)}:${pad(secs)}`;
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} delay - 延迟毫秒数
     * @returns {Function}
     */
    debounce(func, delay = 300) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 间隔毫秒数
     * @returns {Function}
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /**
     * 生成随机ID
     * @param {string} prefix - 前缀
     * @returns {string}
     */
    generateId(prefix = 'id') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `${prefix}_${timestamp}_${random}`;
    },

    /**
     * 深拷贝对象
     * @param {any} obj
     * @returns {any}
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    },

    /**
     * 从 word_id 解析段落、句子、单词索引
     * @param {string} wordId - 格式：段落ID-句子ID-单词ID
     * @returns {Object} { paragraphIndex, sentenceIndex, wordIndex }
     */
    parseWordId(wordId) {
        const parts = wordId.split('-').map(Number);
        return {
            paragraphIndex: parts[0] - 1,
            sentenceIndex: parts[1] - 1,
            wordIndex: parts[2] - 1
        };
    },

    /**
     * 创建 word_id
     * @param {number} paragraphIndex - 段落索引（从1开始）
     * @param {number} sentenceIndex - 句子索引（从1开始）
     * @param {number} wordIndex - 单词索引（从1开始）
     * @returns {string}
     */
    createWordId(paragraphIndex, sentenceIndex, wordIndex) {
        return `${paragraphIndex}-${sentenceIndex}-${wordIndex}`;
    },

    /**
     * 检查是否为空（null, undefined, 空字符串, 空数组, 空对象）
     * @param {any} value
     * @returns {boolean}
     */
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },

    /**
     * 获取 DOM 元素（带缓存）
     * @param {string} selector
     * @param {Element} parent
     * @returns {Element|null}
     */
    $(selector, parent = document) {
        return parent.querySelector(selector);
    },

    /**
     * 获取所有匹配的 DOM 元素
     * @param {string} selector
     * @param {Element} parent
     * @returns {NodeList}
     */
    $$(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },

    /**
     * 添加类名（带动画标记）
     * @param {Element} element
     * @param {string} className
     */
    addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    },

    /**
     * 移除类名
     * @param {Element} element
     * @param {string} className
     */
    removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    },

    /**
     * 切换类名
     * @param {Element} element
     * @param {string} className
     */
    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    }
};

Object.freeze(Utils);
