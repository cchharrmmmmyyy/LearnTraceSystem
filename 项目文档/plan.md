# LearnTraceSystem 前端最小鼠标采集实施基线

## 1. 目标

在现有仓库结构内完成阅读页最小可运行采集链路，不新建平行版页面，不改 Dashboard 设计，只补齐 `analytic.html` 页面的词级悬停采集、会话存储和 JSON 导出能力。

## 2. 实施边界

- 保留现有目录结构与模块分层。
- 采集功能只落在 `LearnTraceSystem/analytic.html` 链路。
- 本轮只实现 `hover` 数据采集，不做滚动、点击、定位阅读、句段分析。
- 本轮不接真实后端接口，只保证导出结构稳定，后端后续可直接解析。

## 3. 核心改动

### 3.1 阅读页接入采集

- 在 `LearnTraceSystem/analytic.html` 中加载 `src/scripts/core/DataCollector.js`。
- 在阅读侧边栏加入最小控制区：
  - 采集状态
  - 当前记录数
  - 当前会话标识
  - 停止/继续采集
  - 重置会话
  - 导出 JSON
  - 最近采集记录预览

### 3.2 句子改为词级 DOM

- 在 `LearnTraceSystem/src/scripts/pages/AnalyticManager.js` 中将句子文本渲染为多个 `.word-item`。
- 每个单词写入 `data-word-id`，格式固定为 `段落ID-句子ID-单词ID`。
- 当前默认所有句子都属于第 `1` 个段落。

### 3.3 采集与存储闭环

- `LearnTraceSystem/src/scripts/core/DataCollector.js` 负责：
  - 监听 `.word-item` 的 `mouseenter` / `mouseleave`
  - 生成标准记录
  - 写入 `DataStorage`
  - 维护最近记录与状态事件
- 增加保护逻辑：
  - 仅在进入和离开同一单词时记一条
  - 忽略没有 `data-word-id` 的节点
  - 忽略极短悬停，减少抖动噪声

### 3.4 按会话存储与导出

- `LearnTraceSystem/src/scripts/core/DataStorage.js` 中的 hover 数据按 `session_id` 归档。
- 导出 JSON 固定结构如下：

```json
{
  "session_id": "session_xxx",
  "export_time": "2026-03-24T10:30:00.000Z",
  "data": [
    {
      "event_type": "hover",
      "word_id": "1-3-5",
      "start_time": 1710000000000,
      "duration": 1200
    }
  ]
}
```

## 4. AI 实施约束

- 不新建新的阅读页面或最小原型目录。
- 不把现有项目改回扁平结构。
- 不修改 `index.html` Dashboard 视觉与用途。
- 所有采集能力只接入现有阅读分析页。
- 输出字段必须严格保持：
  - `event_type`
  - `word_id`
  - `start_time`
  - `duration`

## 5. 验收标准

- 阅读页开始后，句子会拆成可悬停的单词节点。
- 每个单词都有合法 `data-word-id`。
- 鼠标进入并离开单词后，会新增一条 `hover` 记录。
- 停止采集后不再新增记录，恢复后可继续记录。
- 数据实时写入 `localStorage`，刷新前不会丢失。
- 导出 JSON 结构稳定，可直接供后端后续解析。
- 现有阅读计时、上下句切换、结束阅读功能不被破坏。
