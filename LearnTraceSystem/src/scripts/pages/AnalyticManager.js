/**
 * 阅读分析管理模块
 * 功能：管理阅读分析页面的逻辑，包括计时、句子切换、会话管理等
 * 更新日期：2026-03-24
 */

class AnalyticManager {
    constructor() {
        this.sentences = [];
        this.defaultSentences = AppConfig.texts.analytic.sentences;
        this.paragraphIndex = 1;
        this.currentSentenceIndex = 0;
        this.timerInterval = null;
        this.elapsedSeconds = 0;
        this.isReading = false;
        this.sessionStartTime = null;
    }

    /**
     * 初始化
     */
    async init() {
        await this.loadArticle();
        this.cacheElements();
        this.bindEvents();
        this.updateSentenceDisplay();
        this.updateButtonStates();
        this.updateTimerDisplay();
        this.renderCollectorState();
        console.log('[AnalyticManager] 阅读分析模块已初始化');
    }

    /**
     * 加载文章
     */
    async loadArticle() {
        try {
            const response = await apiService.getDefaultArticle();
            if (response && response.code === 200 && response.data) {
                this.sentences = response.data;
                console.log('[AnalyticManager] 已从后端加载文章，共 ' + this.sentences.length + ' 句');
            } else {
                this.sentences = this.defaultSentences;
                console.log('[AnalyticManager] 使用默认文章');
            }
        } catch (error) {
            console.warn('[AnalyticManager] 加载文章失败，使用默认文章:', error);
            this.sentences = this.defaultSentences;
        }
    }

    /**
     * 缓存 DOM 元素
     */
    cacheElements() {
        this.elements = {
            startScreen: document.getElementById('start-screen'),
            analyticContainer: document.getElementById('analytic-container'),
            startReadBtn: document.getElementById('start-read-btn'),
            sidebarToggle: document.getElementById('sidebar-toggle'),
            sidebar: document.querySelector('.sidebar'),
            endBtn: document.getElementById('end-btn'),
            restartBtn: document.getElementById('restart-btn'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            timer: document.getElementById('timer'),
            sentenceCount: document.getElementById('sentence-count'),
            totalTime: document.getElementById('total-time'),
            totalSentences: document.getElementById('total-sentences'),
            sentenceText: document.getElementById('sentence-text'),
            timerPanel: document.getElementById('timer-panel'),
            resultPanel: document.getElementById('result-panel'),
            collectorStatus: document.getElementById('collector-status'),
            collectorCount: document.getElementById('collector-count'),
            collectorSession: document.getElementById('collector-session'),
            collectorToggleBtn: document.getElementById('collector-toggle-btn'),
            collectorResetBtn: document.getElementById('collector-reset-btn'),
            collectorExportBtn: document.getElementById('collector-export-btn'),
            collectorRecentList: document.getElementById('collector-recent-list')
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const {
            startReadBtn,
            sidebarToggle,
            endBtn,
            restartBtn,
            prevBtn,
            nextBtn,
            collectorToggleBtn,
            collectorResetBtn,
            collectorExportBtn
        } = this.elements;

        if (startReadBtn) {
            startReadBtn.addEventListener('click', () => this.enterReadingMode());
        }

        if (sidebarToggle && this.elements.sidebar) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (endBtn) {
            endBtn.addEventListener('click', () => this.endReading());
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartSession());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSentence());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSentence());
        }

        if (collectorToggleBtn) {
            collectorToggleBtn.addEventListener('click', () => this.toggleCollector());
        }

        if (collectorResetBtn) {
            collectorResetBtn.addEventListener('click', () => this.resetCollectorSession());
        }

        if (collectorExportBtn) {
            collectorExportBtn.addEventListener('click', () => this.exportCollectorData());
        }

        document.addEventListener('collector:update', event => this.renderCollectorState(event.detail));
        document.addEventListener('keydown', event => this.handleKeyboard(event));
    }

    /**
     * 进入阅读模式
     */
    enterReadingMode() {
        const { startScreen, analyticContainer } = this.elements;

        if (startScreen && analyticContainer) {
            startScreen.classList.add('start-screen--hidden');
            analyticContainer.style.display = 'flex';
            document.body.classList.add('fullscreen-mode');
            this.showPanel('timer-panel');
            this.startReading();
        }
    }

    /**
     * 切换侧边栏
     */
    toggleSidebar() {
        const { sidebar, sidebarToggle } = this.elements;

        if (sidebar && sidebarToggle) {
            sidebar.classList.toggle('sidebar--collapsed');
            const isCollapsed = sidebar.classList.contains('sidebar--collapsed');
            sidebarToggle.title = isCollapsed
                ? AppConfig.texts.analytic.sidebar.expandTooltip
                : AppConfig.texts.analytic.sidebar.collapseTooltip;
        }
    }

    /**
     * 开始阅读
     */
    startReading() {
        if (this.isReading) return;

        this.isReading = true;
        this.sessionStartTime = new Date();
        this.elapsedSeconds = 0;
        this.updateTimerDisplay();
        this.ensureCollectorReady();
        this.showPanel('timer-panel');
        this.startTimer();
        this.highlightSentence();
        this.renderCollectorState();
    }

    /**
     * 结束阅读
     */
    endReading() {
        if (!this.isReading) return;

        this.stopTimer();
        this.isReading = false;
        if (window.dataCollector) {
            window.dataCollector.stop();
        }

        const sessionData = {
            date: this.sessionStartTime.toISOString(),
            duration: this.elapsedSeconds,
            sentencesRead: this.currentSentenceIndex + 1,
            totalSentences: this.sentences.length
        };

        adminManager.saveSessionData(sessionData);

        const { totalTime, totalSentences } = this.elements;
        if (totalTime) {
            totalTime.textContent = Utils.formatTime(this.elapsedSeconds);
        }
        if (totalSentences) {
            totalSentences.textContent = this.currentSentenceIndex + 1;
        }

        this.showPanel('result-panel');
    }

    /**
     * 重新开始会话
     */
    restartSession() {
        this.stopTimer();
        this.currentSentenceIndex = 0;
        this.elapsedSeconds = 0;
        this.isReading = false;
        this.sessionStartTime = null;

        if (window.dataCollector) {
            window.dataCollector.reset();
            window.dataCollector.stop();
        }

        const { startScreen, analyticContainer } = this.elements;

        if (startScreen && analyticContainer) {
            startScreen.classList.remove('start-screen--hidden');
            analyticContainer.style.display = 'none';
            document.body.classList.remove('fullscreen-mode');
        }

        this.updateSentenceDisplay();
        this.updateButtonStates();
        this.updateTimerDisplay();
        this.renderCollectorState();
    }

    /**
     * 开始计时器
     */
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.elapsedSeconds++;
            this.updateTimerDisplay();
        }, 1000);
    }

    /**
     * 停止计时器
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * 更新计时器显示
     */
    updateTimerDisplay() {
        const { timer } = this.elements;
        if (timer) {
            timer.textContent = Utils.formatTime(this.elapsedSeconds);
        }
    }

    /**
     * 更新句子显示
     */
    updateSentenceDisplay() {
        const { sentenceText, sentenceCount } = this.elements;
        const sentence = this.sentences[this.currentSentenceIndex];

        if (sentenceText) {
            this.renderSentenceWords(sentenceText, sentence);
        }

        if (sentenceCount) {
            sentenceCount.textContent = this.currentSentenceIndex + 1;
        }
    }

    /**
     * 上一句
     */
    previousSentence() {
        if (this.currentSentenceIndex > 0) {
            if (window.dataCollector) {
                window.dataCollector.cancelPendingHover();
            }
            this.currentSentenceIndex--;
            this.updateSentenceDisplay();
            this.updateButtonStates();
            this.highlightSentence();
        }
    }

    /**
     * 下一句
     */
    nextSentence() {
        if (this.currentSentenceIndex < this.sentences.length - 1) {
            if (window.dataCollector) {
                window.dataCollector.cancelPendingHover();
            }
            this.currentSentenceIndex++;
            this.updateSentenceDisplay();
            this.updateButtonStates();
            this.highlightSentence();
        }
    }

    /**
     * 更新按钮状态
     */
    updateButtonStates() {
        const { prevBtn, nextBtn } = this.elements;

        if (prevBtn) {
            prevBtn.disabled = this.currentSentenceIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentSentenceIndex === this.sentences.length - 1;
        }
    }

    /**
     * 高亮句子
     */
    highlightSentence() {
        const { sentenceText } = this.elements;
        if (sentenceText) {
            sentenceText.classList.add('sentence--highlight');
            setTimeout(() => {
                sentenceText.classList.remove('sentence--highlight');
            }, 300);
        }
    }

    /**
     * 显示面板
     * @param {string} panelId
     */
    showPanel(panelId) {
        const panels = ['timer-panel', 'result-panel'];
        panels.forEach(id => {
            const panel = document.getElementById(id);
            if (panel) {
                if (id === panelId) {
                    panel.classList.remove('panel--hidden');
                    panel.classList.add('panel--active');
                } else {
                    panel.classList.remove('panel--active');
                    panel.classList.add('panel--hidden');
                }
            }
        });
    }

    /**
     * 处理键盘事件
     * @param {KeyboardEvent} event
     */
    handleKeyboard(event) {
        if (event.key === 'ArrowLeft') {
            this.previousSentence();
        } else if (event.key === 'ArrowRight') {
            this.nextSentence();
        } else if (event.key === ' ' && this.isReading) {
            event.preventDefault();
            this.endReading();
        }
    }

    /**
     * 将句子渲染为词级 DOM
     * @param {HTMLElement} container
     * @param {string} sentence
     */
    renderSentenceWords(container, sentence) {
        const words = sentence.trim().split(/\s+/);
        container.innerHTML = '';

        words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word-item';
            wordSpan.dataset.wordId = Utils.createWordId(
                this.paragraphIndex,
                this.currentSentenceIndex + 1,
                index + 1
            );
            wordSpan.textContent = word;
            container.appendChild(wordSpan);

            if (index < words.length - 1) {
                container.appendChild(document.createTextNode(' '));
            }
        });
    }

    /**
     * 初始化或重启数据采集会话
     */
    ensureCollectorReady() {
        if (!window.dataCollector) {
            return;
        }

        if (!window.dataCollector.isInitialized) {
            window.dataCollector.init();
        } else {
            window.dataCollector.startSession();
        }
    }

    /**
     * 切换采集状态
     */
    toggleCollector() {
        if (!window.dataCollector) {
            return;
        }

        if (window.dataCollector.getStats().isCollecting) {
            window.dataCollector.stop();
        } else {
            window.dataCollector.resume();
        }
    }

    /**
     * 重置当前采集会话
     */
    resetCollectorSession() {
        if (!window.dataCollector) {
            return;
        }

        window.dataCollector.reset();
    }

    /**
     * 导出当前采集会话
     */
    exportCollectorData() {
        if (!window.dataCollector) {
            return;
        }

        const stats = window.dataCollector.getStats();
        const fileName = `${stats.session_id || 'hover'}_data.json`;
        window.dataCollector.exportData(fileName);
    }

    /**
     * 渲染采集状态面板
     * @param {Object} payload
     */
    renderCollectorState(payload = null) {
        const stats = payload?.stats || window.dataCollector?.getStats?.() || {
            totalRecords: 0,
            session_id: null,
            isCollecting: false
        };
        const recentItems = payload?.recentItems || window.dataCollector?.getRecentItems?.() || [];
        const {
            collectorStatus,
            collectorCount,
            collectorSession,
            collectorToggleBtn,
            collectorRecentList
        } = this.elements;

        if (collectorStatus) {
            collectorStatus.textContent = stats.isCollecting ? '采集中' : '已停止';
            collectorStatus.classList.toggle('collector-status--active', stats.isCollecting);
            collectorStatus.classList.toggle('collector-status--idle', !stats.isCollecting);
        }

        if (collectorCount) {
            collectorCount.textContent = String(stats.totalRecords || 0);
        }

        if (collectorSession) {
            collectorSession.textContent = stats.session_id || '-';
        }

        if (collectorToggleBtn) {
            collectorToggleBtn.textContent = stats.isCollecting ? '停止采集' : '继续采集';
        }

        if (collectorRecentList) {
            collectorRecentList.textContent = recentItems.length === 0
                ? '暂无数据'
                : recentItems.map(item => JSON.stringify(item)).join('\n');
        }
    }

    /**
     * 获取会话统计
     * @returns {Object}
     */
    getSessionStats() {
        const sessions = adminManager ? adminManager.getSessionData() : [];
        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                totalTime: 0,
                averageTime: 0,
                totalSentences: 0
            };
        }

        const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
        const totalSentences = sessions.reduce((sum, session) => sum + session.sentencesRead, 0);

        return {
            totalSessions: sessions.length,
            totalTime: totalTime,
            averageTime: Math.round(totalTime / sessions.length),
            totalSentences: totalSentences
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.analyticManager = new AnalyticManager();
    window.analyticManager.init();
});
