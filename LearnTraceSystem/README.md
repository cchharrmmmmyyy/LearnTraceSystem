# LearnTraceSystem

学习行为追踪与分析系统的前端模块。

## 项目简介

LearnTraceSystem 是一个用于追踪和分析用户学习行为的前端系统。当前版本专注于阅读行为数据采集，包括鼠标悬停事件、阅读时间统计等功能，为后续的行为分析和复盘报告生成提供数据基础。

## 技术栈

- **HTML5** - 语义化结构
- **CSS3** - 模块化样式，使用 CSS 变量
- **JavaScript (ES6+)** - 模块化、面向对象
- **localStorage** - 本地数据存储

## 项目结构

```
LearnTraceSystem/
├── index.html              # 主页面（Dashboard）
├── analytic.html           # 阅读分析页面
├── src/
│   ├── config/
│   │   └── app.config.js   # 全局配置（文字、颜色、路径等）
│   ├── styles/
│   │   ├── main.css        # 主样式入口
│   │   ├── variables.css   # CSS 变量定义
│   │   ├── base.css        # 基础样式重置
│   │   ├── layout.css      # 布局样式
│   │   ├── components/      # 组件样式
│   │   │   ├── navbar.css
│   │   │   ├── footer.css
│   │   │   ├── header.css
│   │   │   ├── card.css
│   │   │   └── button.css
│   │   └── pages/          # 页面特定样式
│   │       └── analytic.css
│   ├── scripts/
│   │   ├── core/           # 核心模块
│   │   │   ├── DataCollector.js   # 数据采集模块
│   │   │   ├── DataStorage.js     # 数据存储模块
│   │   │   └── ComponentLoader.js # 组件加载模块
│   │   ├── modules/         # 功能模块
│   │   │   ├── App.js            # 应用入口
│   │   │   └── AdminManager.js   # 管理模块
│   │   ├── pages/           # 页面逻辑
│   │   │   └── AnalyticManager.js # 阅读分析管理
│   │   └── utils/           # 工具函数
│   │       └── utils.js
│   └── components/          # HTML 组件
│       ├── navbar.html
│       └── footer-info.html
```

## 当前进度

### 已完成 ✅

- [x] 项目结构重构（模块化、分离关注点）
- [x] CSS 变量系统（颜色、间距、字体等）
- [x] 组件化设计（导航栏、页脚、卡片等）
- [x] 核心模块（数据采集、数据存储、组件加载器）
- [x] Dashboard 页面
- [x] 阅读分析页面
- [x] 工具函数库

### 进行中 🔄

- [ ] 数据采集模块完善（根据接口定义优化）
- [ ] 调试功能界面
- [ ] 与 Python 后端接口对接

### 待开发 📋

- [ ] 单词级别悬停数据采集（核心功能）
- [ ] 实时调试面板
- [ ] 数据导出功能
- [ ] 答题功能界面
- [ ] 复盘报告界面

## 核心模块说明

### DataCollector（数据采集模块）

负责采集用户行为数据，当前支持：

- 鼠标悬停事件监听
- 单词级别 ID 生成
- 时间戳和停留时间记录
- 数据格式标准化输出
- 控制台调试输出

**接口格式**（严格遵循 `接口.md` 定义）：

```javascript
{
  "event_type": "hover",
  "word_id": "1-3-5", // 格式：段落ID-句子ID-单词ID
  "start_time": 1710000000000, // 时间戳（毫秒）
  "duration": 1200 // 停留时间（毫秒）
}
```

### DataStorage（数据存储模块）

负责数据持久化管理：

- localStorage 操作封装
- 会话数据管理
- 数据导出（JSON 文件）
- 多会话数据分离

### ComponentLoader（组件加载模块）

负责动态加载 HTML 组件：

- 导航栏自动加载
- 页脚自动加载
- 页面激活状态管理

## 文件作用

| 文件/目录 | 作用 |
|-----------|------|
| `app.config.js` | 全局配置中心，所有文字、颜色、路径可在此修改 |
| `DataCollector.js` | 核心数据采集逻辑 |
| `DataStorage.js` | 数据存储和导出 |
| `ComponentLoader.js` | 组件动态加载 |
| `utils.js` | 通用工具函数 |
| `main.css` | 样式入口，导入所有 CSS 模块 |

## 如何扩展

### 添加新页面

1. 在 `src/styles/pages/` 创建页面样式文件
2. 在 `src/scripts/pages/` 创建页面逻辑文件
3. 在 `src/components/` 添加需要的组件
4. 在 `app.config.js` 的 `texts` 部分添加页面文本配置

### 添加新组件

1. 在 `src/components/` 创建 `.html` 文件
2. 在 `src/styles/components/` 创建样式文件
3. 在 `main.css` 中导入样式文件
4. 使用 `loadComponent()` 函数加载组件

### 修改颜色或样式

在 `src/styles/variables.css` 中修改 CSS 变量，所有样式会自动更新。

### 添加新的数据类型

1. 在 `app.config.js` 中定义数据格式
2. 在 `DataCollector.js` 中实现采集逻辑
3. 在 `DataStorage.js` 中添加存储方法

## 接口定义

系统遵循以下数据接口规范：

```json
{
  "event_type": "hover",
  "word_id": "段落ID-句子ID-单词ID",
  "start_time": "Unix时间戳（毫秒）",
  "duration": "停留时间（毫秒）"
}
```

## 后续扩展方向

1. **数据采集增强** - 完善单词悬停数据采集
2. **调试功能** - 实时数据显示面板
3. **后端对接** - 与 Python 后端 API 集成
4. **答题功能** - 阅读理解答题界面
5. **复盘报告** - 数据可视化和报告生成
6. **标注工具** - 高亮、笔记等功能

## 开发说明

- 所有配置集中在 `app.config.js`
- 所有样式使用 CSS 变量，便于主题切换
- 模块之间低耦合，通过配置和事件通信
- 代码遵循 ES6+ 规范，注释完整

---

**更新时间**: 2026-03-24
**版本**: 1.0.0
