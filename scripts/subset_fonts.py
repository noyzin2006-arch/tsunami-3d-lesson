#!/usr/bin/env python3
"""按需子集化 Noto Sans SC（中文字重 400/600），输出到 public/fonts。
只保留项目实际用到的字符 + 一组 UI/符号字符，保证 woff2 体积可控且不发起外域请求。
用法：python3 scripts/subset_fonts.py
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
INDEX = os.path.join(ROOT, "index.html")
OUT = os.path.join(ROOT, "src", "assets", "fonts")
TTF_400 = "/tmp/NotoSansSC-400.ttf"
TTF_600 = "/tmp/NotoSansSC-600.ttf"

# 额外覆盖 UI / 数学符号 / 标点（即便源码尚未出现也先纳入）
EXTRA = (
    " 0123456789"
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    " .,;:!?()[]{}<>+-*/=≈≠≤≥×÷√→←↑↓·—–‘’“”…、。，；：！？（）【】《》「」『』"
    "①②③④⑤⑥⑦⑧⑨⑩"
    "℃kmhMwTsN²√₁₂₀"
    "开始演示播放暂停重置视角参数水深抬升相位先到波谷先到波峰数值速度波高波长周期倍速"
    "上一章下一章章节来源限制模型示意安全预警真实危险提示加载准备渲染错误重试取消关闭展开图例标记显示隐藏返回读取说明完成重新停止继续当前"
    "第章等点面线体海海底地震断层板块挤压隆起下沉推动水体表面长波能量贯穿整根柱剖切透明深海快却不高船察觉相由决定波长浅水慢下来挤起来前部减速后部追近缩短上升定律理想逐渐变化复杂关键波前变陡有时退突然涨水相位决定必经异常信号不应等待撤离不止一道浪上岸成灾后续多次上涨回落持续小时冲击洪水强水流漂浮覆盖概念模拟时刻范围不可用于实地避险"
    "是否未必来得及监测争取时间路径实际窗口近岸往往来不及"
    "非等比非实时预测夸张标注比例量尺真实并不等于官方解除警报保持远离低洼直至"
    "俯冲带逆断层教学参量计算函数输出差值对比假设"
)

SKIP = {"node_modules", ".git"}


def collect_chars():
    chars = set()
    for base, _, files in os.walk(SRC):
        for f in files:
            if not f.endswith((".js", ".html", ".css", ".json")):
                continue
            p = os.path.join(base, f)
            try:
                with open(p, "r", encoding="utf-8") as fh:
                    chars.update(fh.read())
            except Exception:
                pass
    if os.path.exists(INDEX):
        try:
            with open(INDEX, "r", encoding="utf-8") as fh:
                chars.update(fh.read())
        except Exception:
            pass
    chars.update(EXTRA)
    # 过滤控制字符
    chars = {c for c in chars if ord(c) >= 0x20}
    return chars


def build_unicode_arg(chars):
    cps = sorted({ord(c) for c in chars})
    # 合并连续区间以减少参数长度
    parts = []
    start = prev = cps[0]
    for cp in cps[1:]:
        if cp == prev + 1:
            prev = cp
            continue
        if start == prev:
            parts.append(f"U+{start:04X}")
        else:
            parts.append(f"U+{start:04X}-{prev:04X}")
        start = prev = cp
    if start == prev:
        parts.append(f"U+{start:04X}")
    else:
        parts.append(f"U+{start:04X}-{prev:04X}")
    return ",".join(parts)


def subset(src_ttf, out_name, unicode_arg):
    out_path = os.path.join(OUT, out_name)
    py = sys.executable
    cmd = [
        py, "-m", "fontTools.subset", src_ttf,
        "--unicodes=" + unicode_arg,
        "--output-file=" + out_path,
        "--flavor=woff2",
        "--desubroutinize",
        "--no-hinting",
        "--layout-features=*",
        "--drop-tables+=DSIG",
    ]
    print("subsetting", out_name, "...")
    subprocess.run(cmd, check=True)
    size = os.path.getsize(out_path)
    print(f"  -> {out_name}: {size/1024:.1f} KiB")


def main():
    if not os.path.exists(TTF_400) or not os.path.exists(TTF_600):
        print("缺少 Noto Sans SC TTF 源文件（需 /tmp/NotoSansSC-400.ttf 与 -600.ttf）", file=sys.stderr)
        sys.exit(1)
    os.makedirs(OUT, exist_ok=True)
    chars = collect_chars()
    arg = build_unicode_arg(chars)
    print(f"收集字符数：{len(chars)}")
    subset(TTF_400, "noto-sans-sc-400.woff2", arg)
    subset(TTF_600, "noto-sans-sc-600.woff2", arg)
    total = sum(os.path.getsize(os.path.join(OUT, n)) for n in ("noto-sans-sc-400.woff2", "noto-sans-sc-600.woff2"))
    print(f"中文子集合计：{total/1024:.1f} KiB（预算 ≤ 3 MiB）")


if __name__ == "__main__":
    main()
