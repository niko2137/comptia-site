import zipfile
import re

path = r'C:\Users\Niko\Documents\GitHub\comptia-site\public\reference\book\KDP-hardbook.docx'

with zipfile.ZipFile(path) as z:
    with z.open('word/document.xml') as f:
        content = f.read().decode('utf-8')

# Better extraction: preserve paragraph breaks
# Split on paragraph tags first
paragraphs = re.split(r'</w:p>', content)
lines = []
for para in paragraphs:
    text = re.sub(r'<[^>]+>', '', para)
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&apos;', "'").replace('&quot;', '"')
    if text:
        lines.append(text)

full_text = '\n'.join(lines)

out_path = r'C:\Users\Niko\Documents\GitHub\comptia-site\kdp_hardbook_extracted.txt'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(full_text)

print(f"Written {len(lines)} paragraphs, {len(full_text)} chars to {out_path}")

# Print module headings to know structure
print("\n--- MODULE/CHAPTER HEADINGS ---")
for i, line in enumerate(lines):
    if 'Module' in line and len(line) < 120:
        print(f"Line {i}: {line}")
