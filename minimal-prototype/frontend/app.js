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

// 本地分析算法
class LocalAnalyzer {
    static cleanData(events) {
        // 过滤有效事件
        return events.filter(event => {
            const requiredFields = ['event_type', 'word_id', 'paragraph_id', 'sentence_id', 'start_time', 'duration'];
            const hasAllFields = requiredFields.every(field => field in event);
            const validDuration = event.duration >= 100 && event.duration <= 30000;
            return hasAllFields && validDuration;
        });
    }

    static calculateTotalReadingTime(events) {
        if (!events.length) return 0;
        const sorted = events.sort((a, b) => a.start_time - b.start_time);
        const first = sorted[0].start_time;
        const last = sorted[sorted.length - 1];
        return (last.start_time + last.duration) - first;
    }

    static evaluateReadingEfficiency(totalTimeMs) {
        if (totalTimeMs < 180000) return "high";
        if (totalTimeMs < 600000) return "medium";
        return "low";
    }

    static calculateSentenceDwellTimes(events) {
        const dwell = {};
        events.forEach(event => {
            dwell[event.sentence_id] = (dwell[event.sentence_id] || 0) + event.duration;
        });
        return dwell;
    }

    static calculateParagraphDwellTimes(events) {
        const dwell = {};
        events.forEach(event => {
            const paraId = event.paragraph_id.toString();
            dwell[paraId] = (dwell[paraId] || 0) + event.duration;
        });
        return dwell;
    }

    static calculateWordDwellTimes(events) {
        const dwell = {};
        events.forEach(event => {
            dwell[event.word_id] = (dwell[event.word_id] || 0) + event.duration;
        });
        return dwell;
    }

    static findMaxDwellSentence(sentenceDwell) {
        if (Object.keys(sentenceDwell).length === 0) return null;
        return Object.entries(sentenceDwell).reduce((a, b) => sentenceDwell[a] > sentenceDwell[b] ? a : b);
    }

    static buildReadingPath(events) {
        const sorted = events.sort((a, b) => a.start_time - b.start_time);
        const path = [];
        let lastSentence = null;
        sorted.forEach(event => {
            if (event.sentence_id !== lastSentence) {
                path.push(event.sentence_id);
                lastSentence = event.sentence_id;
            }
        });
        return path;
    }

    static countBackReads(readingPath) {
        let count = 0;
        for (let i = 1; i < readingPath.length; i++) {
            const curr = readingPath[i];
            const prev = readingPath[i-1];
            if (this.compareSentenceIds(curr, prev) < 0) {
                count++;
            }
        }
        return count;
    }

    static compareSentenceIds(id1, id2) {
        try {
            const p1 = id1.split('-');
            const p2 = id2.split('-');
            const para1 = parseInt(p1[0]);
            const sent1 = parseInt(p1[1]);
            const para2 = parseInt(p2[0]);
            const sent2 = parseInt(p2[1]);
            if (para1 !== para2) return para1 - para2;
            return sent1 - sent2;
        } catch {
            return 0;
        }
    }

    static identifyReadingHabits(backReadCount) {
        const habits = ["顺序阅读"];
        if (backReadCount === 0) habits.push("阅读顺序正确");
        return habits;
    }

    static identifyProblems(backReadCount, wordDwell, sentenceDwell) {
        const problems = [];
        if (backReadCount > 3) problems.push("频繁回读");
        const avgWordsPerSentence = Object.keys(wordDwell).length / Math.max(Object.keys(sentenceDwell).length, 1);
        if (avgWordsPerSentence > 8) problems.push("逐词阅读");
        return problems;
    }

    static generateReport(events) {
        const cleanedEvents = this.cleanData(events);
        const totalTime = this.calculateTotalReadingTime(cleanedEvents);
        const efficiency = this.evaluateReadingEfficiency(totalTime);
        const sentenceDwell = this.calculateSentenceDwellTimes(cleanedEvents);
        const paraDwell = this.calculateParagraphDwellTimes(cleanedEvents);
        const wordDwell = this.calculateWordDwellTimes(cleanedEvents);
        const maxDwellSentence = this.findMaxDwellSentence(sentenceDwell);
        const readingPath = this.buildReadingPath(cleanedEvents);
        const backReadCount = this.countBackReads(readingPath);
        const habits = this.identifyReadingHabits(backReadCount);
        const problems = this.identifyProblems(backReadCount, wordDwell, sentenceDwell);

        const totalSeconds = Math.floor(totalTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeStr = `${minutes}分${seconds}秒`;

        const efficiencyMap = { high: '高', medium: '中等', low: '低' };

        const recommendations = [];
        if (efficiency === 'high') recommendations.push("继续保持良好的阅读习惯");
        else if (efficiency === 'medium') recommendations.push("尝试提高阅读速度，可以尝试意群阅读而非逐词阅读");
        else recommendations.push("建议先理解文章结构，再深入细节阅读");
        
        if (problems.includes("频繁回读")) recommendations.push("减少回读次数，尝试向前阅读遇到不懂的地方先标记继续");
        if (problems.includes("逐词阅读")) recommendations.push("练习意群阅读，一次看多个词而非单个词");

        return {
            summary: {
                total_reading_time: timeStr,
                reading_efficiency: efficiencyMap[efficiency],
                event_count: cleanedEvents.length
            },
            detailed_analysis: {
                total_reading_time_ms: totalTime,
                sentence_dwell_times: sentenceDwell,
                paragraph_dwell_times: paraDwell,
                word_dwell_times: wordDwell,
                back_read_count: backReadCount,
                reading_path: readingPath,
                max_dwell_sentence: maxDwellSentence,
                reading_efficiency: efficiency,
                reading_habits: habits,
                identified_problems: problems,
                cleaned_event_count: cleanedEvents.length,
                raw_event_count: events.length
            },
            recommendations: recommendations
        };
    }
}

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
        
        // 使用本地分析算法
        const report = LocalAnalyzer.generateReport(events);
        
        this.readingScreen.style.display = 'none';
        this.reportScreen.style.display = 'block';
        
        this.renderReport(report);
    }

    renderReport(report) {
        console.log('[UI] Rendering report:', report);
        
        if (!report) {
            this.reportSummary.innerHTML = `
                <div class="summary-card" style="grid-column: 1 / -1;">
                    <span class="summary-label">错误</span>
                    <span class="summary-value">API 调用失败，请检查网络连接</span>
                </div>
            `;
            return;
        }
        
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
