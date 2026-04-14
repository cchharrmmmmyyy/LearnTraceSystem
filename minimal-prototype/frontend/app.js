const API_BASE_URL = 'http://localhost:5000';

const articleData = [
    {
        paragraphId: 1,
        sentences: [
            {
                sentenceId: '1-1',
                words: ['Reading', 'is', 'an', 'essential', 'skill', 'that', 'opens', 'doors', 'to', 'knowledge', 'and', 'understanding.']
            },
            {
                sentenceId: '1-2',
                words: ['It', 'allows', 'us', 'to', 'explore', 'new', 'ideas', 'and', 'gain', 'insights', 'from', 'different', 'perspectives.']
            }
        ]
    },
    {
        paragraphId: 2,
        sentences: [
            {
                sentenceId: '2-1',
                words: ['Effective', 'reading', 'requires', 'focus', 'and', 'active', 'engagement', 'with', 'the', 'text.']
            },
            {
                sentenceId: '2-2',
                words: ['By', 'paying', 'attention', 'to', 'keywords', 'and', 'main', 'ideas,', 'we', 'can', 'improve', 'our', 'comprehension', 'and', 'retention.']
            }
        ]
    }
];

class DataCollector {
    constructor() {
        this.sessionId = null;
        this.events = [];
        this.currentWord = null;
        this.hoverStartTime = null;
        this.minHoverDuration = 100;
    }

    startSession() {
        this.sessionId = 'session_' + Date.now();
        this.events = [];
        console.log('[DataCollector] Session started:', this.sessionId);
        return this.sessionId;
    }

    handleMouseEnter(wordId, paragraphId, sentenceId) {
        this.currentWord = { wordId, paragraphId, sentenceId };
        this.hoverStartTime = Date.now();
    }

    handleMouseLeave() {
        if (!this.currentWord || !this.hoverStartTime) return;

        const duration = Date.now() - this.hoverStartTime;
        
        if (duration >= this.minHoverDuration) {
            const event = {
                event_type: 'hover',
                word_id: this.currentWord.wordId,
                paragraph_id: this.currentWord.paragraphId,
                sentence_id: this.currentWord.sentenceId,
                start_time: this.hoverStartTime,
                duration: duration
            };
            this.events.push(event);
            console.log('[DataCollector] Recorded event:', event);
        }

        this.currentWord = null;
        this.hoverStartTime = null;
    }

    getEvents() {
        return [...this.events];
    }

    getEventCount() {
        return this.events.length;
    }
}

class APIService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async collectData(sessionId, events) {
        try {
            const response = await fetch(`${this.baseUrl}/api/collect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, events: events })
            });
            return await response.json();
        } catch (error) {
            console.error('[API] Collect error:', error);
            return null;
        }
    }

    async analyzeData(sessionId, events) {
        try {
            const response = await fetch(`${this.baseUrl}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, events: events })
            });
            return await response.json();
        } catch (error) {
            console.error('[API] Analyze error:', error);
            return null;
        }
    }
}

class UIManager {
    constructor() {
        this.dataCollector = new DataCollector();
        this.apiService = new APIService(API_BASE_URL);
        this.timerInterval = null;
        this.startTime = null;
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.startScreen = document.getElementById('start-screen');
        this.readingScreen = document.getElementById('reading-screen');
        this.reportScreen = document.getElementById('report-screen');
        this.articleContent = document.getElementById('article-content');
        this.timerDisplay = document.getElementById('timer');
        this.recordCount = document.getElementById('record-count');
        this.reportSummary = document.getElementById('report-summary');
        this.reportDetails = document.getElementById('report-details');
        this.reportRecommendations = document.getElementById('report-recommendations');
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startReading());
        document.getElementById('end-btn').addEventListener('click', () => this.endReading());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }

    generateArticleHTML() {
        let html = '';
        articleData.forEach(paragraph => {
            html += '<div class="paragraph">';
            paragraph.sentences.forEach(sentence => {
                html += '<div class="sentence">';
                sentence.words.forEach((word, wordIndex) => {
                    const wordId = `${paragraph.paragraphId}-${sentence.sentenceId.split('-')[1]}-${wordIndex}`;
                    html += `<span class="word-item" 
                        data-word-id="${wordId}" 
                        data-paragraph-id="${paragraph.paragraphId}" 
                        data-sentence-id="${sentence.sentenceId}"
                        onmouseenter="uiManager.onWordEnter(this)"
                        onmouseleave="uiManager.onWordLeave(this)"
                    >${word}</span> `;
                });
                html += '</div>';
            });
            html += '</div>';
        });
        return html;
    }

    onWordEnter(element) {
        const wordId = element.dataset.wordId;
        const paragraphId = parseInt(element.dataset.paragraphId);
        const sentenceId = element.dataset.sentenceId;
        this.dataCollector.handleMouseEnter(wordId, paragraphId, sentenceId);
    }

    onWordLeave(element) {
        this.dataCollector.handleMouseLeave();
        this.updateRecordCount();
    }

    updateRecordCount() {
        this.recordCount.textContent = this.dataCollector.getEventCount();
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            this.timerDisplay.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    async startReading() {
        this.dataCollector.startSession();
        this.articleContent.innerHTML = this.generateArticleHTML();
        
        this.startScreen.style.display = 'none';
        this.readingScreen.style.display = 'flex';
        
        this.startTimer();
        this.updateRecordCount();
        
        console.log('[UI] Reading started');
    }

    async endReading() {
        this.stopTimer();
        
        const events = this.dataCollector.getEvents();
        const sessionId = this.dataCollector.sessionId;
        
        console.log('[UI] Ending reading, collected events:', events.length);
        
        await this.apiService.collectData(sessionId, events);
        
        const report = await this.apiService.analyzeData(sessionId, events);
        
        this.readingScreen.style.display = 'none';
        this.reportScreen.style.display = 'block';
        
        this.renderReport(report);
    }

    renderReport(report) {
        console.log('[UI] Rendering report:', report);
        
        if (report.error) {
            this.reportSummary.innerHTML = `
                <div class="summary-card" style="grid-column: 1 / -1;">
                    <span class="summary-label">错误</span>
                    <span class="summary-value">${report.error}</span>
                </div>
            `;
            return;
        }

        const summary = report.summary;
        const analysis = report.detailed_analysis;
        const recommendations = report.recommendations;

        this.reportSummary.innerHTML = `
            <div class="summary-card">
                <span class="summary-label">总阅读时长</span>
                <span class="summary-value">${summary.total_reading_time}</span>
            </div>
            <div class="summary-card">
                <span class="summary-label">阅读效率</span>
                <span class="summary-value efficiency-${analysis.reading_efficiency}">${summary.reading_efficiency}</span>
            </div>
            <div class="summary-card">
                <span class="summary-label">采集记录</span>
                <span class="summary-value">${summary.event_count}</span>
            </div>
        `;

        this.reportDetails.innerHTML = `
            <h3>📊 详细分析</h3>
            <div class="detail-section">
                <div class="detail-label">阅读习惯</div>
                <div>${analysis.reading_habits.map(h => `<span class="habit-tag">${h}</span>`).join('')}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">识别到的问题</div>
                <div>${analysis.identified_problems.length > 0 
                    ? analysis.identified_problems.map(p => `<span class="problem-tag">${p}</span>`).join('')
                    : '<span style="color: #28a745;">✓ 未发现明显问题</span>'}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">回读次数</div>
                <div>${analysis.back_read_count}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">阅读路径</div>
                <div class="detail-content">${JSON.stringify(analysis.reading_path, null, 2)}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">句子停留时间（毫秒）</div>
                <div class="detail-content">${JSON.stringify(analysis.sentence_dwell_times, null, 2)}</div>
            </div>
        `;

        this.reportRecommendations.innerHTML = `
            <h3>💡 建议</h3>
            <ul class="recommendation-list">
                ${recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
        `;
    }

    restart() {
        this.reportScreen.style.display = 'none';
        this.startScreen.style.display = 'flex';
        this.timerDisplay.textContent = '00:00';
        this.recordCount.textContent = '0';
    }
}

const uiManager = new UIManager();
