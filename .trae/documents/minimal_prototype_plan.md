# LearnTrace 最小原型实施计划

## 1. 需求分析

目标：创建一个最小可运行的全流程原型，使用：
- 前端：原生 JavaScript + HTML + CSS
- 后端：Python + Flask（轻量级Web框架）
- 数据格式：JSON

核心功能：
1. 前端采集用户阅读时的鼠标悬停数据
2. 前端将数据发送到 Python 后端
3. 后端分析数据并生成报告
4. 前端展示分析报告

## 2. 现有项目研究结论

现有 LearnTrace 项目已实现：
- 完整的前端数据采集逻辑（[DataCollector.js](file:///workspace/LearnTraceSystem/src/scripts/core/DataCollector.js)）
- 基于 Spring Boot 的 Java 后端
- 鼠标悬停事件监听、单词级别的数据采集
- 行为分析算法（统计阅读时间、阅读路径、回读行为等）

## 3. 项目结构

```
minimal-prototype/
├── frontend/
│   ├── index.html          # 主页面
│   ├── style.css           # 样式
│   └── app.js              # 前端逻辑（数据采集、API调用）
├── backend/
│   └── app.py              # Python 后端（Flask）
├── data/                   # 数据存储目录
│   └── sessions/           # 会话数据
└── README.md
```

## 4. 文件和模块编辑计划

### 4.1 前端部分

**文件：`minimal-prototype/frontend/index.html`**
- 包含阅读文章内容（单词标注）
- 控制面板（开始/结束/导出）
- 分析报告展示区域

**文件：`minimal-prototype/frontend/style.css`**
- 基础页面布局
- 单词悬停高亮效果
- 报告展示样式

**文件：`minimal-prototype/frontend/app.js`**
- 数据采集模块（参考现有项目）
- API 调用模块（与 Python 后端通信）
- UI 交互逻辑
- 报告渲染模块

### 4.2 后端部分

**文件：`minimal-prototype/backend/app.py`**
- Flask 应用初始化
- 数据采集接口 (`POST /api/collect`)
- 数据分析接口 (`POST /api/analyze`)
- 报告生成逻辑（参考现有 Java 代码）
- JSON 数据文件存储

## 5. 实施步骤

### 步骤 1：创建项目目录结构
- 建立 `minimal-prototype` 文件夹及子目录
- 初始化基本文件

### 步骤 2：实现前端数据采集
- 构建 HTML 页面，包含可悬停的单词元素
- 实现鼠标悬停事件监听
- 记录单词 ID、悬停时间、持续时间
- 数据格式标准化

### 步骤 3：实现 Python 后端
- 使用 Flask 创建 Web 服务器
- 实现 `/api/collect` 接口接收数据
- 实现数据存储（JSON 文件）
- 实现 `/api/analyze` 接口进行分析

### 步骤 4：实现分析算法
- 计算总阅读时间
- 统计句子/段落/单词停留时间
- 分析阅读路径
- 检测回读行为
- 生成完整分析报告

### 步骤 5：前后端集成
- 前端发送数据到后端
- 前端请求分析报告
- 前端渲染展示报告

### 步骤 6：测试与调试
- 完整流程测试
- 边界条件验证
- 性能优化

## 6. 数据格式定义

### 阅读事件 (ReadingEvent)
```json
{
  "event_type": "hover",
  "word_id": "1-1-3",
  "paragraph_id": 1,
  "sentence_id": "1-1",
  "start_time": 1710000000000,
  "duration": 1200
}
```

### 分析报告 (AnalysisReport)
```json
{
  "total_reading_time_ms": 5000,
  "sentence_dwell_times": {"1-1": 3000, "1-2": 2000},
  "paragraph_dwell_times": {"1": 5000},
  "word_dwell_times": {"1-1-1": 500, "1-1-2": 800},
  "back_read_count": 0,
  "reading_path": ["1-1", "1-2"],
  "max_dwell_sentence": "1-1",
  "reading_efficiency": "high",
  "reading_habits": ["顺序阅读"],
  "identified_problems": []
}
```

## 7. 依赖与考虑

### 前端依赖
- 无需额外库，原生 JavaScript 即可
- 支持现代浏览器（Chrome, Firefox, Edge）

### 后端依赖
- Python 3.7+
- Flask (`pip install flask`)
- Flask-CORS (`pip install flask-cors`)

## 8. 风险处理

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 浏览器兼容性问题 | 中 | 使用标准 DOM API，测试主流浏览器 |
| 数据丢失 | 高 | 同时使用 localStorage 和后端存储 |
| 性能问题 | 低 | 原型阶段不做优化，保持简单 |
| CORS 跨域问题 | 中 | 使用 Flask-CORS 解决 |

## 9. 验证标准

- 完整流程可以跑通：开始阅读 → 采集数据 → 结束阅读 → 生成报告
- 数据准确记录并存储
- 分析报告正确生成和展示
- 代码结构清晰，易于理解和扩展
