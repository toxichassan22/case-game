import json
import re

def parse_audio():
    with open(r'd:\game\cases\case01\records.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    audios = []
    blocks = re.split(r'\n(?=\d+- \*\*)', content)
    
    for i, block in enumerate(blocks):
        if not block.strip() or not block[0].isdigit():
            continue
        
        # Extract title
        title_match = re.search(r'\d+- \*\*(.*?)\*\*:', block)
        title = title_match.group(1).strip() if title_match else ""
        
        # Extract transcript
        transcript_match = re.search(r'"(.*?)"', block, re.DOTALL)
        transcript = transcript_match.group(1).strip() if transcript_match else ""
        
        # Extract description
        desc_match = re.search(r'\*\((.*?)\)\*', block, re.DOTALL)
        desc = desc_match.group(1).strip() if desc_match else ""
        
        num = len(audios) + 1
        audios.append({
            "id": f"audio{num:02d}",
            "file": f"audio{num:02d}.wav",
            "title": title,
            "transcript": transcript,
            "description": desc
        })
    return audios

def parse_videos():
    with open(r'd:\game\cases\case01\videos.md', 'r', encoding='utf-8') as f:
        content = f.read()
        
    videos = []
    blocks = re.findall(r'\d+-\((.*?)\)', content, re.DOTALL)
    
    for i, block in enumerate(blocks):
        parts = block.split(',', 1)
        title = parts[0].strip()
        desc = parts[1].strip() if len(parts) > 1 else ""
        
        num = i + 1
        videos.append({
            "id": f"video{num:02d}",
            "file": f"video{num:02d}.mp4",
            "title": title,
            "description": desc
        })
    return videos

def parse_photos():
    with open(r'd:\game\cases\case01\photo.md', 'r', encoding='utf-8') as f:
        content = f.read()
        
    images = []
    reports = []
    
    blocks = re.findall(r'\d+-\((.*?)\)', content, re.DOTALL)
    
    photo_num = 1
    report_num = 1
    
    for i, block in enumerate(blocks):
        if i < 13:
            images.append({
                "id": f"photo{photo_num:02d}",
                "file": f"photo{photo_num:02d}.png",
                "description": block.strip()
            })
            photo_num += 1
        else:
            reports.append({
                "id": f"report{report_num:02d}",
                "file": f"report{report_num:02d}.png",
                "description": block.strip()
            })
            report_num += 1
            
    return images, reports

data = {
    "id": "case01",
    "audio": parse_audio(),
    "videos": parse_videos(),
    "images": parse_photos()[0],
    "reports": parse_photos()[1]
}

with open(r'd:\game\frontend\public\assets\cases\case01\data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("JSON created successfully!")
