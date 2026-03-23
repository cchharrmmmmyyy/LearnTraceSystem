class AnalyticManager {
    constructor() {
        this.sentences = [
            "Reading is an essential skill that opens doors to knowledge and understanding.",
            "Practice makes perfect when it comes to improving reading speed and comprehension.",
            "The more you read, the better you become at understanding complex ideas.",
            "Focus and concentration are key to effective reading and learning.",
            "Set aside dedicated time each day for your reading practice.",
            "Track your progress to see how much you improve over time.",
            "Choose materials that interest you to maintain motivation.",
            "Take breaks when needed to avoid fatigue and maintain focus.",
            "Discuss what you read with others to deepen your understanding.",
            "Celebrate small victories on your journey to becoming a better reader."
        ];
        
        this.currentSentenceIndex = 0;
        this.timerInterval = null;
        this.elapsedSeconds = 0;
        this.isReading = false;
        this.sessionStartTime = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSentenceDisplay();
        this.updateButtonStates();
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-btn');
        const endBtn = document.getElementById('end-btn');
        const restartBtn = document.getElementById('restart-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startReading());
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

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    startReading() {
        if (this.isReading) return;
        
        this.isReading = true;
        this.sessionStartTime = new Date();
        this.elapsedSeconds = 0;
        
        this.showPanel('timer-panel');
        this.startTimer();
        
        adminManager.showNotification('阅读计时已开始', 'success');
        this.highlightSentence();
    }

    endReading() {
        if (!this.isReading) return;
        
        this.stopTimer();
        this.isReading = false;
        
        const sessionData = {
            date: this.sessionStartTime.toISOString(),
            duration: this.elapsedSeconds,
            sentencesRead: this.currentSentenceIndex + 1,
            totalSentences: this.sentences.length
        };
        
        adminManager.saveSessionData(sessionData);
        
        document.getElementById('total-time').textContent = adminManager.formatTime(this.elapsedSeconds);
        document.getElementById('total-sentences').textContent = this.currentSentenceIndex + 1;
        
        this.showPanel('result-panel');
        adminManager.showNotification('阅读会话已保存', 'success');
    }

    restartSession() {
        this.currentSentenceIndex = 0;
        this.elapsedSeconds = 0;
        this.isReading = false;
        
        this.updateSentenceDisplay();
        this.updateButtonStates();
        this.showPanel('start-panel');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsedSeconds++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = adminManager.formatTime(this.elapsedSeconds);
        }
    }

    updateSentenceDisplay() {
        const sentenceElement = document.getElementById('sentence-text');
        const currentSentenceElement = document.getElementById('current-sentence');
        const totalSentencesElement = document.getElementById('total-sentences-display');
        const sentenceCountElement = document.getElementById('sentence-count');
        
        if (sentenceElement) {
            sentenceElement.textContent = this.sentences[this.currentSentenceIndex];
        }
        
        if (currentSentenceElement) {
            currentSentenceElement.textContent = this.currentSentenceIndex + 1;
        }
        
        if (totalSentencesElement) {
            totalSentencesElement.textContent = this.sentences.length;
        }
        
        if (sentenceCountElement) {
            sentenceCountElement.textContent = this.currentSentenceIndex + 1;
        }
    }

    previousSentence() {
        if (this.currentSentenceIndex > 0) {
            this.currentSentenceIndex--;
            this.updateSentenceDisplay();
            this.updateButtonStates();
            this.highlightSentence();
        }
    }

    nextSentence() {
        if (this.currentSentenceIndex < this.sentences.length - 1) {
            this.currentSentenceIndex++;
            this.updateSentenceDisplay();
            this.updateButtonStates();
            this.highlightSentence();
        }
    }

    updateButtonStates() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSentenceIndex === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentSentenceIndex === this.sentences.length - 1;
        }
    }

    highlightSentence() {
        const sentenceElement = document.getElementById('sentence-text');
        if (sentenceElement) {
            sentenceElement.classList.add('highlight');
            setTimeout(() => {
                sentenceElement.classList.remove('highlight');
            }, 300);
        }
    }

    showPanel(panelId) {
        const panels = ['start-panel', 'timer-panel', 'result-panel'];
        panels.forEach(id => {
            const panel = document.getElementById(id);
            if (panel) {
                if (id === panelId) {
                    panel.classList.remove('hidden');
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                    panel.classList.add('hidden');
                }
            }
        });
    }

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

    getSessionStats() {
        const sessions = adminManager.getSessionData();
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
});
