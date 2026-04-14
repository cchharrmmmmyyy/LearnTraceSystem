# 数据分析算法详细计划

## 1. 概述

本计划详细说明如何对采集到的阅读行为数据进行清洗、分析和信息提取，最终生成一份完整的阅读行为分析报告。

## 2. 数据流程

```
原始数据采集 → 数据清洗 → 数据预处理 → 多维度分析 → 报告生成
```

## 3. 原始数据结构

### 3.1 单条阅读事件 (ReadingEvent)
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

### 3.2 字段说明
- **event_type**: 事件类型（当前仅支持 "hover"）
- **word_id**: 单词唯一标识，格式：段落ID-句子ID-单词索引
- **paragraph_id**: 段落编号（整数）
- **sentence_id**: 句子唯一标识，格式：段落ID-句子索引
- **start_time**: 悬停开始时间戳（毫秒）
- **duration**: 悬停持续时间（毫秒）

## 4. 数据清洗

### 4.1 清洗步骤

#### 步骤 1: 数据完整性检查
- 检查每条记录是否包含必需字段
- 过滤掉字段缺失的记录
- 验证字段类型检查

```python
def clean_data_step1(events):
    required_fields = ['event_type', 'word_id', 'paragraph_id', 'sentence_id', 'start_time', 'duration']
    cleaned = []
    for event in events:
        if all(field in event for field in required_fields):
            cleaned.append(event)
    return cleaned
```

#### 步骤 2: 异常值过滤
- 过滤持续时间过短的记录（< 100ms，认为是误触）
- 过滤持续时间过长的记录（> 30000ms，认为是异常）
- 过滤时间戳不合理的记录

```python
def clean_data_step2(events, min_duration=100, max_duration=30000):
    cleaned = []
    for event in events:
        if min_duration <= event['duration'] <= max_duration:
            cleaned.append(event)
    return cleaned
```

#### 步骤 3: 去重处理
- 去除完全重复的记录
- 去除同一单词短时间内的重复悬停（< 500ms）

```python
def clean_data_step3(events, repeat_threshold=500):
    # 按时间排序
    sorted_events = sorted(events, key=lambda x: x['start_time'])
    
    cleaned = []
    last_hover = {}  # word_id -> last_end_time
    
    for event in sorted_events:
        word_id = event['word_id']
        current_start = event['start_time']
        
        if word_id not in last_hover or current_start - last_hover[word_id] > repeat_threshold:
            cleaned.append(event)
            last_hover[word_id] = current_start + event['duration']
    
    return cleaned
```

### 4.2 最终清洗函数
```python
def clean_data(raw_events):
    events = clean_data_step1(raw_events)
    events = clean_data_step2(events)
    events = clean_data_step3(events)
    return events
```

## 5. 数据预处理

### 5.1 按时间排序
确保所有事件按时间顺序排列
```python
def sort_by_time(events):
    return sorted(events, key=lambda x: x['start_time'])
```

### 5.2 解析 ID 解析
从 word_id 和 sentence_id 中提取数字信息
```python
def parse_ids(events):
    for event in events:
        # 解析 word_id
        word_parts = event['word_id'].split('-')
        event['_para_idx'] = int(word_parts[0])
        event['_sent_idx'] = int(word_parts[1])
        event['_word_idx'] = int(word_parts[2])
    return events
```

## 6. 多维度数据分析

### 6.1 时间维度分析

#### 6.1.1 总阅读时间计算
```python
def calculate_total_reading_time(events):
    if not events:
        return 0
    sorted_events = sorted(events, key=lambda x: x['start_time'])
    first_start = sorted_events[0]['start_time']
    last_event = sorted_events[-1]
    last_end = last_event['start_time'] + last_event['duration']
    return last_end - first_start
```

#### 6.1.2 阅读效率评估
根据总阅读时间评估效率：
- < 3分钟 (180000ms): 高
- 3-10分钟 (180000-600000ms): 中
- > 10分钟: 低

```python
def evaluate_reading_efficiency(total_time_ms):
    if total_time_ms < 180000:
        return "high"
    elif total_time_ms < 600000:
        return "medium"
    else:
        return "low"
```

### 6.2 空间维度分析（停留时间统计）

#### 6.2.1 单词级别停留时间
```python
def calculate_word_dwell_times(events):
    word_dwell = {}
    for event in events:
        word_id = event['word_id']
        word_dwell[word_id] = word_dwell.get(word_id, 0) + event['duration']
    return word_dwell
```

#### 6.2.2 句子级别停留时间
```python
def calculate_sentence_dwell_times(events):
    sentence_dwell = {}
    for event in events:
        sentence_id = event['sentence_id']
        sentence_dwell[sentence_id] = sentence_dwell.get(sentence_id, 0) + event['duration']
    return sentence_dwell
```

#### 6.2.3 段落级别停留时间
```python
def calculate_paragraph_dwell_times(events):
    para_dwell = {}
    for event in events:
        para_id = str(event['paragraph_id'])
        para_dwell[para_id] = para_dwell.get(para_id, 0) + event['duration']
    return para_dwell
```

#### 6.2.4 找出停留时间最长的句子
```python
def find_max_dwell_sentence(sentence_dwell):
    if not sentence_dwell:
        return None
    return max(sentence_dwell.items(), key=lambda x: x[1])[0]
```

### 6.3 阅读路径分析

#### 6.3.1 构建阅读路径
```python
def build_reading_path(events):
    sorted_events = sorted(events, key=lambda x: x['start_time'])
    path = []
    last_sentence = None
    for event in sorted_events:
        curr_sentence = event['sentence_id']
        if curr_sentence != last_sentence:
            path.append(curr_sentence)
            last_sentence = curr_sentence
    return path
```

#### 6.3.2 句子ID比较函数
```python
def compare_sentence_ids(id1, id2):
    try:
        p1 = id1.split('-')
        p2 = id2.split('-')
        para1 = int(p1[0])
        sent1 = int(p1[1])
        para2 = int(p2[0])
        sent2 = int(p2[1])
        if para1 != para2:
            return para1 - para2
        return sent1 - sent2
    except:
        return 0 if id1 == id2 else -1
```

#### 6.3.3 检测回读行为
```python
def count_back_reads(reading_path):
    back_count = 0
    if len(reading_path) < 2:
        return 0
    for i in range(1, len(reading_path)):
        curr = reading_path[i]
        prev = reading_path[i-1]
        if compare_sentence_ids(curr, prev) < 0:
            back_count += 1
    return back_count
```

### 6.4 阅读习惯与问题识别

#### 6.4.1 识别阅读习惯
```python
def identify_reading_habits(back_read_count, reading_path):
    habits = []
    habits.append("顺序阅读")
    if back_read_count == 0:
        habits.append("阅读顺序正确")
    return habits
```

#### 6.4.2 识别潜在问题
```python
def identify_problems(back_read_count, word_dwell, sentence_dwell, max_dwell_sentence, correct_answer_sentence=None):
    problems = []
    
    # 频繁回读
    if back_read_count > 3:
        problems.append("频繁回读")
    
    # 定位困难（如果有正确答案）
    if correct_answer_sentence and max_dwell_sentence != correct_answer_sentence:
        problems.append("定位困难")
    
    # 逐词阅读
    avg_words_per_sentence = len(word_dwell) / max(len(sentence_dwell), 1)
    if avg_words_per_sentence > 8:
        problems.append("逐词阅读")
    
    return problems
```

## 7. 综合分析函数

```python
def analyze_behavior(events, correct_answer_sentence=None):
    # 1. 数据清洗
    cleaned_events = clean_data(events)
    if not cleaned_events:
        return None
    
    # 2. 数据预处理
    sorted_events = sort_by_time(cleaned_events)
    parsed_events = parse_ids(sorted_events)
    
    # 3. 时间分析
    total_time = calculate_total_reading_time(parsed_events)
    efficiency = evaluate_reading_efficiency(total_time)
    
    # 4. 空间分析
    word_dwell = calculate_word_dwell_times(parsed_events)
    sentence_dwell = calculate_sentence_dwell_times(parsed_events)
    para_dwell = calculate_paragraph_dwell_times(parsed_events)
    max_dwell_sentence = find_max_dwell_sentence(sentence_dwell)
    
    # 5. 路径分析
    reading_path = build_reading_path(parsed_events)
    back_read_count = count_back_reads(reading_path)
    
    # 6. 习惯与问题识别
    habits = identify_reading_habits(back_read_count, reading_path)
    problems = identify_problems(back_read_count, word_dwell, sentence_dwell, max_dwell_sentence, correct_answer_sentence)
    
    # 7. 构建结果
    result = {
        "total_reading_time_ms": total_time,
        "sentence_dwell_times": sentence_dwell,
        "paragraph_dwell_times": para_dwell,
        "word_dwell_times": word_dwell,
        "back_read_count": back_read_count,
        "reading_path": reading_path,
        "max_dwell_sentence": max_dwell_sentence,
        "reading_efficiency": efficiency,
        "reading_habits": habits,
        "identified_problems": problems,
        "cleaned_event_count": len(cleaned_events),
        "raw_event_count": len(events)
    }
    
    return result
```

## 8. 报告生成

### 8.1 报告格式
```json
{
  "summary": {
    "total_reading_time": "5分30秒",
    "reading_efficiency": "中等",
    "event_count": 45
  },
  "detailed_analysis": {
    "total_reading_time_ms": 330000,
    "sentence_dwell_times": {"1-1": 3000, "1-2": 2000},
    "paragraph_dwell_times": {"1": 5000},
    "word_dwell_times": {"1-1-1": 500, "1-1-2": 800},
    "back_read_count": 0,
    "reading_path": ["1-1", "1-2"],
    "max_dwell_sentence": "1-1",
    "reading_efficiency": "high",
    "reading_habits": ["顺序阅读"],
    "identified_problems": []
  },
  "recommendations": [
    "继续保持良好的阅读习惯",
    "尝试提高阅读速度"
  ]
}
```

### 8.2 生成建议
```python
def generate_recommendations(analysis_result):
    recommendations = []
    
    efficiency = analysis_result['reading_efficiency']
    problems = analysis_result['identified_problems']
    back_count = analysis_result['back_read_count']
    
    if efficiency == 'high':
        recommendations.append("继续保持良好的阅读习惯")
    elif efficiency == 'medium':
        recommendations.append("尝试提高阅读速度，可以尝试意群阅读而非逐词阅读")
    else:
        recommendations.append("建议先理解文章结构，再深入细节阅读")
    
    if '频繁回读' in problems:
        recommendations.append("减少回读次数，尝试向前阅读遇到不懂的地方先标记继续")
    
    if '逐词阅读' in problems:
        recommendations.append("练习意群阅读，一次看多个词而非单个词")
    
    if '定位困难' in problems:
        recommendations.append("提高信息定位能力，注意关键词和主题句")
    
    return recommendations
```

## 9. 完整流程函数

```python
def generate_full_report(raw_events, correct_answer_sentence=None):
    # 1. 行为分析
    analysis = analyze_behavior(raw_events, correct_answer_sentence)
    
    if not analysis:
        return {
            "error": "无有效数据",
            "summary": None,
            "detailed_analysis": None,
            "recommendations": []
        }
    
    # 2. 格式化时间
    total_seconds = analysis['total_reading_time_ms'] // 1000
    minutes = total_seconds // 60
    seconds = total_seconds % 60
    time_str = f"{minutes}分{seconds}秒"
    
    # 3. 效率映射
    efficiency_map = {
        'high': '高',
        'medium': '中等',
        'low': '低'
    }
    
    # 4. 生成建议
    recommendations = generate_recommendations(analysis)
    
    # 5. 构建完整报告
    report = {
        "summary": {
            "total_reading_time": time_str,
            "reading_efficiency": efficiency_map[analysis['reading_efficiency']],
            "event_count": analysis['cleaned_event_count']
        },
        "detailed_analysis": analysis,
        "recommendations": recommendations
    }
    
    return report
```

## 10. 验证与测试

### 10.1 测试场景
1. **正常阅读场景
2. **频繁回读场景
3. **逐词阅读场景
4. **无数据场景
5. **异常数据场景

### 10.2 验证指标
- 数据清洗准确率 > 95%
- 分析结果一致性
- 报告生成速度 < 100ms
