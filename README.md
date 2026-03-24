# LearnTraceSystem 学习行为追踪系统

## 项目简介

LearnTraceSystem 是一个用于采集和分析用户阅读英文文章行为数据的系统。通过追踪用户在阅读过程中的鼠标悬停行为，分析用户的阅读习惯、学习效率和潜在问题，最终生成详细的学习行为分析报告，帮助用户优化阅读策略。

---

## 项目状态

> **当前状态**: 基础功能开发中  
> **最后更新**: 2026-03-25

### 已完成 ✅

- [x] 后端 Spring Boot 框架搭建
- [x] 前端 HTML/CSS/JS 基础页面
- [x] 鼠标悬停数据采集功能
- [x] 前后端数据对接（基础）
- [x] CORS 跨域配置
- [x] 行为分析算法（代码实现，但未被调用）
- [x] 项目文档编写

### 进行中 🔄

- [ ] 前后端完整对接（分析功能）
- [ ] 数据持久化
- [ ] 前端响应式布局优化

### 待完成 ⏳

- [ ] 结束信号接口
- [ ] 文章动态加载
- [ ] 分析结果展示
- [ ] 历史记录功能
- [ ] 用户系统

---

## 技术栈

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 25 | 运行环境 |
| Spring Boot | 3.3.4 | Web 框架 |
| Lombok | 1.18.42 | 代码简化 |
| Maven | 3.9.14 | 构建工具 |

### 前端

| 技术 | 说明 |
|------|------|
| HTML5 | 页面结构 |
| CSS3 | 样式设计 |
| JavaScript (ES6+) | 交互逻辑 |
| Fetch API | HTTP 请求 |

---

## 项目结构

```
LearnTraceSystem/
├── README.md                      # 项目说明文档（本文档）
├── 项目说明文档.md                  # 详细项目文档
├── 问题.md                        # 问题记录
│
├── LearnTraceBackend/            # 后端项目
│   ├── pom.xml                   # Maven 配置
│   └── src/main/
│       ├── java/                 # Java 源码
│       │   └── org/example/learntracebackend/
│       │       ├── LearnTraceBackendApplication.java    # 启动类
│       │       ├── config/
│       │       │   └── CorsConfig.java                 # CORS 配置
│       │       ├── controller/
│       │       │   ├── BehaviorController.java         # 行为接口
│       │       │   └── HoverDataController.java       # 悬停数据接口
│       │       ├── model/
│       │       │   ├── ApiResponse.java               # 响应模型
│       │       │   ├── BehaviorAnalysisResult.java    # 分析结果
│       │       │   ├── HoverDataRequest.java          # 请求模型
│       │       │   ├── HoverRecord.java               # 悬停记录
│       │       │   ├── ReadingEvent.java              # 阅读事件
│       │       │   └── RecognitionResult.java         # 识别结果
│       │       └── service/
│       │           └── BehaviorService.java            # 分析服务
│       └── resources/
│           └── application.properties                 # 应用配置
│
└── LearnTraceSystem/             # 前端项目
    ├── analytic.html             # 阅读分析页面
    ├── index.html                # 首页
    └── src/
        ├── config/
        │   └── app.config.js     # 应用配置
        ├── scripts/
        │   ├── core/
        │   │   ├── ComponentLoader.js    # 组件加载
        │   │   ├── DataCollector.js      # 数据采集
        │   │   └── DataStorage.js       # 数据存储
        │   ├── modules/
        │   │   ├── AdminManager.js      # 管理员模块
        │   │   └── App.js              # 主应用
        │   ├── pages/
        │   │   └── AnalyticManager.js   # 分析页面
        │   └── utils/
        │       ├── ApiService.js        # API 服务
        │       └── utils.js             # 工具函数
        └── styles/                      # 样式文件
```

---

## 快速开始

### 环境要求

- Java 17+
- Maven 3.6+
- Python 3.x（用于前端服务，可选）

### 启动后端

```bash
cd LearnTraceBackend
./mvnw.cmd spring-boot:run
```

后端启动成功后访问 http://localhost:8080

### 启动前端

```bash
cd LearnTraceSystem
python -m http.server 8081
```

前端访问 http://localhost:8081/analytic.html

---

## 功能说明

### 当前可用功能

1. **数据采集**
   - 前端自动采集鼠标悬停数据
   - 包括：事件类型、段落ID、句子ID、单词ID、开始时间、停留时长
   - 数据实时同步到后端

2. **数据存储**
   - 前端：localStorage 本地存储
   - 后端：内存存储（当前版本，重启后丢失）

3. **行为分析**（代码已实现，需调用）
   - 计算总阅读时间
   - 统计各句子/段落/单词停留时间
   - 分析阅读路径
   - 检测回读行为
   - 识别学习问题

### 接口列表

| 接口 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/behavior/collect` | POST | 采集行为数据 | ✅ 可用 |
| `/api/behavior/analyze` | POST | 行为分析 | ⚠️ 未调用 |
| `/api/behavior/recognize` | POST | 行为识别 | ⚠️ 未调用 |
| `/api/hover-data/{sessionId}` | GET | 获取悬停数据 | ⚠️ 未调用 |
| `/api/hover-data/{sessionId}` | DELETE | 删除悬停数据 | ⚠️ 未调用 |

---

## 数据流程

```
用户阅读
   │
   ▼
┌──────────────────┐
│  前端 DataCollector │
│  采集悬停数据      │
└──────────────────┘
   │
   ▼
┌──────────────────┐
│  本地存储         │
│  localStorage    │
└──────────────────┘
   │
   ▼ (实时同步)
┌──────────────────┐
│  后端 API        │
│  /collect        │
└──────────────────┘
   │
   ▼
┌──────────────────┐
│  内存 Map        │
│  sessionEvents   │
└──────────────────┘
   │
   ▼ (需调用)
┌──────────────────┐
│  行为分析        │
│  analyze        │
└──────────────────┘
   │
   ▼
┌──────────────────┐
│  分析结果返回    │
│  recognize       │
└──────────────────┘
```

---

## 数据模型

### ReadingEvent（阅读事件）

```json
{
    "event_type": "hover",
    "paragraph_id": 1,
    "sentence_id": "1-1",
    "word_id": "1-1-3",
    "start_time": 1774367404011,
    "duration": 536
}
```

### BehaviorAnalysisResult（分析结果）

```json
{
    "totalReadingTime": 5000,
    "sentenceDwellTimes": {"1-1": 3000, "1-2": 2000},
    "paragraphDwellTimes": {"1": 5000},
    "wordDwellTimes": {"1-1-1": 500, "1-1-2": 800},
    "backReadCount": 0,
    "readingPath": ["1-1", "1-2"],
    "positioningAccurate": false,
    "maxDwellSentence": "1-1"
}
```

### RecognitionResult（识别结果）

```json
{
    "readingEfficiency": "high",
    "readingHabits": ["顺序阅读", "阅读顺序正确"],
    "identifiedProblems": []
}
```

---

## 当前问题

### 前端问题

| 问题 | 优先级 | 说明 |
|------|--------|------|
| 响应式布局 | 高 | 窗口大小改变时页面布局会乱 |
| 文章写死 | 高 | 文章内容硬编码，无法动态加载 |
| 缺少结束信号 | 高 | 结束阅读时未通知后端 |
| 未实现功能 | 中 | 阅读结果展示、历史记录等 |

### 后端问题

| 问题 | 优先级 | 说明 |
|------|--------|------|
| 数据仅存内存 | 高 | 重启后数据丢失 |
| 缺少文章接口 | 高 | 无法动态加载文章 |
| 分析未调用 | 高 | 分析代码存在但未执行 |
| 缺少停止接口 | 高 | 无会话结束接口 |
| 终端输出乱 | 中 | System.out.println 不规范 |

---

## 开发计划

### 第一阶段：核心功能完善（进行中）

- [x] 前后端基础对接
- [x] 数据采集功能
- [ ] 结束信号接口
- [ ] 数据持久化（TXT）
- [ ] 分析功能调用

### 第二阶段：功能扩展

- [ ] 文章动态加载
- [ ] 分析结果展示
- [ ] 历史记录功能
- [ ] 前端布局优化

### 第三阶段：优化体验

- [ ] 用户系统
- [ ] 数据导出
- [ ] 日志规范化
- [ ] 更多分析维度

---

## 常见问题

### Q: 前端发送数据成功但后端没有收到？

A: 检查后端是否启动，端口是否正确（8080），CORS 配置是否生效。

### Q: 后端重启后数据丢失？

A: 这是预期行为，当前版本数据仅存储在内存中，后续会添加文件持久化。

### Q: 如何测试分析功能？

A: 当前分析接口未被前端调用，可通过 Postman 或 curl 手动调用 `/api/behavior/recognize`。

---

## 更新日志

### 2026-03-25

- 添加 CORS 跨域支持
- 修复前端重复发送数据问题
- 修复 sentence_id 格式问题
- 添加项目文档
- 初步完成前后端数据对接

### 2026-03-24

- 项目初始化
- 搭建 Spring Boot 后端框架
- 创建前端基础页面
- 实现鼠标悬停数据采集

---

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。

---

**注意**: 本项目目前处于开发早期阶段，许多功能尚未完善，仅供学习参考。
