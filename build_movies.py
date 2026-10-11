#!/usr/bin/env python3
"""Assemble movies.json from verified worker outputs."""
import json, os

BASE = os.path.dirname(os.path.abspath(__file__))
scratch = os.path.join(BASE, "data-scratch")

def load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)

movies = []

# --- archive.org world films ---
ia_path = os.path.join(scratch, "ia.json")
if os.path.exists(ia_path):
    ia = load(ia_path)
    descs = load(os.path.join(scratch, "desc-map.json"))
    for v in ia["verified"]:
        ident = v["identifier"]
        title = v["title"]
        desc = descs.get(title) or descs.get(title.replace(" Jr.", ", Jr.")) or ""
        movies.append({
            "title": title,
            "title_my": None,
            "year": v.get("year"),
            "genre": v.get("genre"),
            "lang": "silent/English",
            "tab": "world",
            "source": "archive",
            "ref": ident,
            "poster": "https://archive.org/services/img/" + ident,
            "desc": desc,
        })
    print("world films:", len(ia["verified"]))
else:
    print("ia.json not found — skipping world")

# --- youtube myanmar films ---
yt_path = os.path.join(scratch, "yt.json")
if os.path.exists(yt_path):
    yt = load(yt_path)
    for v in yt["verified"]:
        vid = v["videoId"]
        movies.append({
            "title": v.get("title") or "",
            "title_my": v.get("title") or "",
            "year": v.get("year"),
            "genre": v.get("genre") or "drama",
            "lang": "မြန်မာ",
            "tab": "myanmar",
            "source": "youtube",
            "ref": vid,
            "poster": "https://i.ytimg.com/vi/" + vid + "/hqdefault.jpg",
            "desc": v.get("desc") or ("YouTube မှာ တရားဝင်တင်ထားတဲ့ မြန်မာဇာတ်ကား — " + (v.get("channel") or "")),
        })
    print("myanmar films:", len(yt["verified"]))
else:
    print("yt.json not found — skipping myanmar (re-run after worker lands)")

out = os.path.join(BASE, "movies.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump({"movies": movies}, f, ensure_ascii=False, indent=1)
print("wrote", out, "with", len(movies), "movies")
