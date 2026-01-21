import re

file_path = '/home/imran-rafi/Desktop/test/Projects/pocket-lawyer/frontend/pages/ChatPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacements map (English substring -> Bangla replacement line content)
# We match loosely on the label/desc to avoid icon encoding issues
replacements = [
    (
        r"label: 'Police Harassment', desc: 'Dealing with bribes or threats'",
        "label: 'পুলিশের হয়রানি', desc: 'ঘুষ বা হুমকি মোকাবেলা'"
    ),
    (
        r"label: 'False Dowry Case', desc: 'Defense against fake Section 11\(Ga\)'",
        "label: 'মিথ্যা যৌতুক মামলা', desc: 'মিথ্যা মামলা থেকে বাঁচার উপায়'"
    ),
    (
        r"label: 'Arms Possession', desc: 'Laws on keeping guns in BD'",
        "label: 'অস্ত্র রাখার আইন', desc: 'বাংলাদেশে লাইসেন্স ও শাস্তি'"
    ),
    (
        r"label: 'GD Filing Guide', desc: 'How to file a General Diary'",
        "label: 'জিডি করার নিয়ম', desc: 'থানায় সাধারণ ডায়েরি করার গাইড'"
    )
]

new_content = content
for pattern, replacement in replacements:
    new_content = re.sub(pattern, replacement, new_content)

if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated prompts.")
else:
    print("No matches found to replace.")
