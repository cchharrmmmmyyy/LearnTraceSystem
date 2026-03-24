/**
 * 数据采集模块
 * 功能：采集单词级别的鼠标悬停行为数据，严格符合接口定义
 * 更新日期：2026-03-24
 */

class DataCollector {
    constructor() {
        this.isInitialized = false;
        this.isCollecting = false;
        this.hoverData = [];
        this.currentSessionId = null;
        this.currentWordElement = null;
        this.currentWordId = null;
        this.hoverStartTime = null;
        this.recentItems = [];
        this.maxRecentItems = AppConfig.dataCollection.maxRecentItems;
        this.eventType = AppConfig.dataCollection.eventType;
        this.minHoverDuration = AppConfig.dataCollection.minHoverDuration;
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    /**
     * 初始化采集器
     */
    init() {
        if (!this.isInitialized) {
            this.bindWordEvents();
            this.isInitialized = true;
            console.log('[DataCollector] 数据采集模块已初始化');
        }

        this.startSession();
    }

    /**
     * 开始新的采集会话
     */
    startSession() {
        this.cancelPendingHover();
        this.currentSessionId = dataStorage.generateSessionId();
        this.hoverData = [];
        this.recentItems = [];
        this.isCollecting = true;
        dataStorage.startHoverSession(this.currentSessionId);
        this.emitUpdate();
        console.log(`[DataCollector] 会话开始: ${this.currentSessionId}`);
    }

    /**
     * 停止采集
     */
    stop() {
        this.isCollecting = false;
        this.cancelPendingHover();
        this.emitUpdate();
        console.log('[DataCollector] 采集已停止');
    }

    /**
     * 恢复采集
     */
    resume() {
        this.isCollecting = true;
        this.emitUpdate();
        console.log('[DataCollector] 采集已恢复');
    }

    /**
     * 重置采集数据
     */
    reset() {
        if (this.currentSessionId) {
            dataStorage.clearHoverSession(this.currentSessionId);
        }

        this.startSession();
        console.log('[DataCollector] 数据已重置');
    }

    /**
     * 绑定单词事件监听
     */
    bindWordEvents() {
        document.addEventListener('mouseenter', this.handleMouseEnter, true);
        document.addEventListener('mouseleave', this.handleMouseLeave, true);
    }

    /**
     * 处理鼠标进入事件
     * @param {MouseEvent} event
     */
    handleMouseEnter(event) {
        if (!this.isCollecting) return;

        const target = event.target;
        if (!target.classList?.contains('word-item')) return;

        const wordId = target.dataset.wordId;
        if (!wordId) return;

        this.currentWordElement = target;
        this.currentWordId = wordId;
        this.hoverStartTime = Date.now();
    }

    /**
     * 处理鼠标离开事件
     * @param {MouseEvent} event
     */
    handleMouseLeave(event) {
        if (!this.isCollecting || !this.currentWordElement || !this.currentWordId || !this.hoverStartTime) {
            return;
        }

        const target = event.target;
        if (!target.classList?.contains('word-item')) return;
        if (target !== this.currentWordElement) return;

        const endTime = Date.now();
        const duration = endTime - this.hoverStartTime;

        if (duration < this.minHoverDuration) {
            this.cancelPendingHover();
            return;
        }

        const record = {
            event_type: this.eventType,
            word_id: this.currentWordId,
            start_time: this.hoverStartTime,
            duration: duration
        };

        this.addRecord(record);
        this.cancelPendingHover();
    }

    /**
     * 添加采集记录
     * @param {Object} record
     */
    addRecord(record) {
        this.hoverData.push(record);
        this.updateRecentItems(record);
        this.logRecord(record);
        dataStorage.addHoverRecord(this.currentSessionId, record);
        this.emitUpdate();
    }

    /**
     * 更新最近采集项（用于调试面板显示）
     * @param {Object} record
     */
    updateRecentItems(record) {
        this.recentItems.unshift(record);
        if (this.recentItems.length > this.maxRecentItems) {
            this.recentItems.pop();
        }
    }

    /**
     * 输出记录到控制台
     * @param {Object} record
     */
    logRecord(record) {
        const debugRecord = {
            ...record,
            timestamp: new Date(record.start_time).toISOString()
        };
        console.log('[DataCollector] 采集数据:', JSON.stringify(debugRecord, null, 2));
    }

    /**
     * 获取采集数据
     * @returns {Array}
     */
    getData() {
        return [...this.hoverData];
    }

    /**
     * 获取最近采集项
     * @returns {Array}
     */
    getRecentItems() {
        return [...this.recentItems];
    }

    /**
     * 获取采集统计
     * @returns {Object}
     */
    getStats() {
        return {
            totalRecords: this.hoverData.length,
            session_id: this.currentSessionId,
            isCollecting: this.isCollecting
        };
    }

    /**
     * 导出采集数据
     * @param {string} filename
     */
    exportData(filename = 'hover_data.json') {
        const exportData = {
            session_id: this.currentSessionId,
            export_time: new Date().toISOString(),
            data: this.hoverData
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`[DataCollector] 数据已导出: ${filename}`);
    }

    /**
     * 取消当前悬停状态
     */
    cancelPendingHover() {
        this.currentWordElement = null;
        this.currentWordId = null;
        this.hoverStartTime = null;
    }

    /**
     * 派发采集状态更新事件
     */
    emitUpdate() {
        document.dispatchEvent(new CustomEvent('collector:update', {
            detail: {
                stats: this.getStats(),
                recentItems: this.getRecentItems()
            }
        }));
    }
}

const dataCollector = new DataCollector();
window.dataCollector = dataCollector;
