/**
 * 应用全局配置
 * 功能：集中管理所有可配置项，包括文本、颜色、路径等
 * 更新时间：2026-03-24
 */

const AppConfig = {
    app: {
        name: 'LearnTraceSystem',
        version: '1.0.0',
        language: 'zh-CN'
    },

    paths: {
        components: 'src/components/',
        styles: 'src/styles/',
        scripts: 'src/scripts/',
        dataCollector: 'src/scripts/core/DataCollector.js',
        dataStorage: 'src/scripts/core/DataStorage.js',
        componentLoader: 'src/scripts/core/ComponentLoader.js'
    },

    texts: {
        navbar: {
            title: 'LearnTraceSystem',
            brand: 'L',
            dashboard: 'Dashboard',
            analytics: 'Analytics',
            courses: 'Courses',
            resources: 'Resources',
            searchPlaceholder: '搜索',
            notifications: '通知',
            userCenter: '用户中心'
        },
        footer: {
            copyright: '© 2025 LearnTraceSystem',
            version: 'Version'
        },
        dashboard: {
            pageTitle: 'LearnTraceSystem',
            colorCards: {
                primaryDark: { title: '#112d4e', name: 'Primary Dark' },
                primaryBlue: { title: '#3f72af', name: 'Primary Blue', desc: 'Used for primary buttons, core functionality entry points, and title emphasis.' },
                lightGray: { title: '#e2e8f0', name: 'Light Gray', desc: 'Upgraded light gray-blue. Used for card backgrounds and modal backgrounds.' }
            },
            iconCards: {
                courseAnalysis: { title: 'Course Analysis', desc: 'Data visualization for learning trace', icon: '📘' },
                immersiveTest: { title: 'Immersive Test', desc: 'Deep focus learning environment', icon: '📄' },
                knowledgeBase: { title: 'Knowledge Base', desc: 'Personal study material archive', icon: '💼' },
                userCenter: { title: 'User Center', desc: 'Account and settings management', icon: '👤' }
            },
            listCard: {
                accentPurple: { title: '#a78bfa', desc: 'Accent purple, used for highlights, progress bars, and selected states to add a touch of light luxury.' },
                weaknessMap: 'Weakness Map',
                dataReports: 'Data Reports',
                learningProgress: 'Learning Progress',
                confirmAction: 'Confirm Action'
            }
        },
        analytic: {
            pageTitle: '阅读分析',
            startScreen: {
                icon: '📖',
                title: '阅读分析',
                description: '专注于您的英语阅读练习',
                tips: '通过计时阅读提升阅读速度与理解能力',
                startButton: '开始阅读'
            },
            readingTitle: '英语阅读练习',
            sidebar: {
                collapseTooltip: '收起边栏',
                expandTooltip: '展开边栏',
                timerLabel: '计时器',
                sentenceLabel: '句子',
                endButton: '结束',
                restartButton: '重新开始',
                readingComplete: '阅读完成',
                durationLabel: '时长',
                sentencesLabel: '句子'
            },
            controls: {
                previous: '上一句',
                next: '下一句'
            },
            sentences: [
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
            ]
        },
        notifications: {
            sessionSaved: '阅读记录已保存',
            sessionCleared: '阅读记录已清除',
            exportSuccess: '数据导出成功',
            exportError: '数据导出失败'
        }
    },

    colors: {
        primary: {
            dark: '#112d4e',
            blue: '#3f72af',
            hover: '#3367d6'
        },
        accent: {
            purple: '#a78bfa'
        },
        background: {
            page: '#f4f6f9',
            card: '#e2e8f0',
            white: '#ffffff'
        },
        text: {
            muted: '#94a3b8',
            light: '#f9f7f7',
            dark: '#112d4e'
        },
        border: {
            light: '#eef2f6'
        },
        status: {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b'
        }
    },

    storage: {
        keys: {
            userData: 'adminUserData',
            readingSessions: 'readingSessions',
            hoverData: 'hoverData',
            sessionId: 'currentSessionId'
        },
        maxSessions: 100
    },

    dataCollection: {
        eventType: 'hover',
        debounceDelay: 100,
        maxRecentItems: 5,
        minHoverDuration: 60
    },

    ui: {
        animation: {
            duration: 300,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
        },
        breakpoints: {
            mobile: 480,
            tablet: 768,
            desktop: 1024
        }
    },

    api: {
        baseURL: '',
        timeout: 10000,
        enableSync: false
    }
};

Object.freeze(AppConfig);
