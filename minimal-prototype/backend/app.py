from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'sessions')
os.makedirs(DATA_DIR, exist_ok=True)


def clean_data_step1(events):
    required_fields = ['event_type', 'word_id', 'paragraph_id', 'sentence_id', 'start_time', 'duration']
    cleaned = []
    for event in events:
        if all(field in event for field in required_fields):
            cleaned.append(event)
    return cleaned


def clean_data_step2(events, min_duration=100, max_duration=30000):
    cleaned = []
    for event in events:
        if min_duration <= event['duration'] <= max_duration:
            cleaned.append(event)
    return cleaned


def clean_data_step3(events, repeat_threshold=500):
    sorted_events = sorted(events, key=lambda x: x['start_time'])
    cleaned = []
    last_hover = {}
    for event in sorted_events:
        word_id = event['word_id']
        current_start = event['start_time']
        if word_id not in last_hover or current_start - last_hover[word_id] > repeat_threshold:
            cleaned.append(event)
            last_hover[word_id] = current_start + event['duration']
    return cleaned


def clean_data(raw_events):
    events = clean_data_step1(raw_events)
    events = clean_data_step2(events)
    events = clean_data_step3(events)
    return events


def sort_by_time(events):
    return sorted(events, key=lambda x: x['start_time'])


def parse_ids(events):
    for event in events:
        word_parts = event['word_id'].split('-')
        event['_para_idx'] = int(word_parts[0])
        event['_sent_idx'] = int(word_parts[1])
        event['_word_idx'] = int(word_parts[2])
    return events


def calculate_total_reading_time(events):
    if not events:
        return 0
    sorted_events = sorted(events, key=lambda x: x['start_time'])
    first_start = sorted_events[0]['start_time']
    last_event = sorted_events[-1]
    last_end = last_event['start_time'] + last_event['duration']
    return last_end - first_start


def evaluate_reading_efficiency(total_time_ms):
    if total_time_ms < 180000:
        return "high"
    elif total_time_ms < 600000:
        return "medium"
    else:
        return "low"


def calculate_word_dwell_times(events):
    word_dwell = {}
    for event in events:
        word_id = event['word_id']
        word_dwell[word_id] = word_dwell.get(word_id, 0) + event['duration']
    return word_dwell


def calculate_sentence_dwell_times(events):
    sentence_dwell = {}
    for event in events:
        sentence_id = event['sentence_id']
        sentence_dwell[sentence_id] = sentence_dwell.get(sentence_id, 0) + event['duration']
    return sentence_dwell


def calculate_paragraph_dwell_times(events):
    para_dwell = {}
    for event in events:
        para_id = str(event['paragraph_id'])
        para_dwell[para_id] = para_dwell.get(para_id, 0) + event['duration']
    return para_dwell


def find_max_dwell_sentence(sentence_dwell):
    if not sentence_dwell:
        return None
    return max(sentence_dwell.items(), key=lambda x: x[1])[0]


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


def identify_reading_habits(back_read_count, reading_path):
    habits = []
    habits.append("顺序阅读")
    if back_read_count == 0:
        habits.append("阅读顺序正确")
    return habits


def identify_problems(back_read_count, word_dwell, sentence_dwell, max_dwell_sentence, correct_answer_sentence=None):
    problems = []
    if back_read_count > 3:
        problems.append("频繁回读")
    if correct_answer_sentence and max_dwell_sentence != correct_answer_sentence:
        problems.append("定位困难")
    avg_words_per_sentence = len(word_dwell) / max(len(sentence_dwell), 1)
    if avg_words_per_sentence > 8:
        problems.append("逐词阅读")
    return problems


def analyze_behavior(events, correct_answer_sentence=None):
    cleaned_events = clean_data(events)
    if not cleaned_events:
        return None
    sorted_events = sort_by_time(cleaned_events)
    parsed_events = parse_ids(sorted_events)
    total_time = calculate_total_reading_time(parsed_events)
    efficiency = evaluate_reading_efficiency(total_time)
    word_dwell = calculate_word_dwell_times(parsed_events)
    sentence_dwell = calculate_sentence_dwell_times(parsed_events)
    para_dwell = calculate_paragraph_dwell_times(parsed_events)
    max_dwell_sentence = find_max_dwell_sentence(sentence_dwell)
    reading_path = build_reading_path(parsed_events)
    back_read_count = count_back_reads(reading_path)
    habits = identify_reading_habits(back_read_count, reading_path)
    problems = identify_problems(back_read_count, word_dwell, sentence_dwell, max_dwell_sentence, correct_answer_sentence)
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


def generate_recommendations(analysis_result):
    recommendations = []
    efficiency = analysis_result['reading_efficiency']
    problems = analysis_result['identified_problems']
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


def generate_full_report(raw_events, correct_answer_sentence=None):
    analysis = analyze_behavior(raw_events, correct_answer_sentence)
    if not analysis:
        return {
            "error": "无有效数据",
            "summary": None,
            "detailed_analysis": None,
            "recommendations": []
        }
    total_seconds = analysis['total_reading_time_ms'] // 1000
    minutes = total_seconds // 60
    seconds = total_seconds % 60
    time_str = f"{minutes}分{seconds}秒"
    efficiency_map = {'high': '高', 'medium': '中等', 'low': '低'}
    recommendations = generate_recommendations(analysis)
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


def save_session_data(session_id, events):
    file_path = os.path.join(DATA_DIR, f"{session_id}.json")
    data = {
        "session_id": session_id,
        "created_at": datetime.now().isoformat(),
        "events": events
    }
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@app.route('/api/collect', methods=['POST'])
def collect_data():
    data = request.json
    session_id = data.get('session_id')
    events = data.get('events', [])
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
    save_session_data(session_id, events)
    return jsonify({"success": True, "message": f"Collected {len(events)} events"})


@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    session_id = data.get('session_id')
    events = data.get('events', [])
    correct_answer = data.get('correct_answer_sentence')
    if not events:
        file_path = os.path.join(DATA_DIR, f"{session_id}.json")
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                session_data = json.load(f)
                events = session_data.get('events', [])
    report = generate_full_report(events, correct_answer)
    return jsonify(report)


@app.route('/')
def index():
    return jsonify({"message": "LearnTrace Minimal Prototype Backend"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
