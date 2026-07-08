import zipfile
import re

path = r'C:\Users\Niko\Documents\GitHub\comptia-site\public\reference\book\book.docx'

with zipfile.ZipFile(path) as z:
    with z.open('word/document.xml') as f:
        content = f.read().decode('utf-8')

# Better extraction: preserve paragraph breaks
paragraphs = re.split(r'</w:p>', content)
lines = []
for para in paragraphs:
    text = re.sub(r'<[^>]+>', '', para)
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&apos;', "'").replace('&quot;', '"')
    if text:
        lines.append(text)

full_text = '\n'.join(lines)

out_path = r'C:\Users\Niko\Documents\GitHub\comptia-site\book_updated_extracted.txt'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(full_text)

print(f"Written {len(lines)} paragraphs, {len(full_text)} chars to {out_path}")

# Search for potential issues
print("\n=== CHECKING FOR PLACEMENT ISSUES ===")
placement_keywords = ['insert after', 'insert module', 'place after', 'add after', '*insert', 'TODO', 'FIXME']
for i, line in enumerate(lines):
    line_lower = line.lower()
    for keyword in placement_keywords:
        if keyword.lower() in line_lower:
            print(f"Line {i}: {line[:100]}")
            break

print("\n=== QUICK REVIEW SECTIONS ===")
for i, line in enumerate(lines):
    if 'Quick Review' in line:
        print(f"Line {i}: {line}")
