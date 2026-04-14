# LearnTrace 最小原型

使用原生 JavaScript + Python + JSON 构建的最小可运行的阅读行为分析系统原型。

## 功能特性

- **数据采集**：追踪鼠标悬停行为，记录单词级别的阅读数据
- **数据分析**：清洗数据、统计阅读时间、分析阅读路径、识别阅读习惯
- **报告生成**：生成完整的阅读行为分析报告，包含建议
- **全流程**：从数据采集到报告展示的完整闭环

## 技术栈

- 前端：HTML5 + CSS3 + 原生 JavaScript (ES6+)
- 后端：Python 3.7+ + Flask
- 数据格式：JSON

## 项目结构

```
minimal-prototype/
├── frontend/
│   ├── index.html          # 主页面
│   ├── style.css           # 样式文件
│   └── app.js              # 前端逻辑
├── backend/
│   └── app.py              # Python 后端
├── data/
│   └── sessions/           # 会话数据存储
└── README.md
```

## 快速开始

### 1. 安装 Python 依赖

```bash
cd minimal-prototype/backend
pip install flask flask-cors
```

### 2. 启动后端服务

```bash
cd minimal-prototype/backend
python app.py
```

后端服务将在 `http://localhost:5000` 启动

### 3. 启动前端

打开新的终端窗口：

```bash
cd minimal-prototype/frontend
python -m http.server 8000
```

### 4. 使用系统

在浏览器中访问：`http://localhost:8000`

## 使用流程

1. 点击 **开始阅读** 按钮
2. 阅读文章，将鼠标悬停在单词上（系统会自动记录）
3. 点击 **结束阅读** 按钮
4. 查看生成的分析报告

## 数据格式

### 阅读事件
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

### 分析报告
```json
{
  "summary": {
    "total_reading_time": "2分30秒",
    "reading_efficiency": "中等",
    "event_count": 45
  },
  "detailed_analysis": {
    "total_reading_time_ms": 150000,
    "back_read_count": 2,
    "reading_path": ["1-1", "1-2", "2-1"],
    "reading_habits": ["顺序阅读"],
    "identified_problems": []
  },
  "recommendations": [
    "继续保持良好的阅读习惯"
  ]
}
```

## API 接口

### POST /api/collect
采集阅读行为数据

**请求体：**
```json
{
  "session_id": "session_1234567890",
  "events": [...]
}
```

### POST /api/analyze
分析数据并生成报告

**请求体：**
```json
{
  "session_id": "session_1234567890",
  "events": [...]
}
```

## 分析维度

- **时间维度**：总阅读时间、阅读效率评估
- **空间维度**：单词/句子/段落停留时间统计
- **路径分析**：阅读路径追踪、回读行为检测
- **习惯识别**：阅读习惯分类、潜在问题识别
- **智能建议**：基于分析结果给出个性化建议

## 许可证

MIT License
