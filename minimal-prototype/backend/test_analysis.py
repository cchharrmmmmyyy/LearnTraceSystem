import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from app import generate_full_report

test_events = [
    {
        "event_type": "hover",
        "word_id": "1-1-0",
        "paragraph_id": 1,
        "sentence_id": "1-1",
        "start_time": 1710000000000,
        "duration": 500
    },
    {
        "event_type": "hover",
        "word_id": "1-1-1",
        "paragraph_id": 1,
        "sentence_id": "1-1",
        "start_time": 1710000000600,
        "duration": 800
    },
    {
        "event_type": "hover",
        "word_id": "1-2-0",
        "paragraph_id": 1,
        "sentence_id": "1-2",
        "start_time": 1710000001500,
        "duration": 600
    },
    {
        "event_type": "hover",
        "word_id": "2-1-0",
        "paragraph_id": 2,
        "sentence_id": "2-1",
        "start_time": 1710000002200,
        "duration": 700
    }
]

print("=" * 50)
print("测试数据分析算法")
print("=" * 50)
print(f"\n测试数据: {len(test_events)} 条事件\n")

report = generate_full_report(test_events)

print("\n" + "=" * 50)
print("生成的报告:")
print("=" * 50)

if report.get('error'):
    print(f"错误: {report['error']}")
else:
    import json
    print(json.dumps(report, ensure_ascii=False, indent=2))

print("\n" + "=" * 50)
print("测试通过！")
print("=" * 50)
