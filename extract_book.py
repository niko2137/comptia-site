import zipfile
import re
import sys

path = r'C:\Users\Niko\Documents\GitHub\comptia-site\public\reference\book\hardback.docx'

with zipfile.ZipFile(path) as z:
    with z.open('word/document.xml') as f:
        content = f.read().decode('utf-8')

# Strip XML tags
text = re.sub(r'<[^>]+>', ' ', content)
# Collapse whitespace
text = re.sub(r'\s+', ' ', text)
# Clean up entities
text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&apos;', "'").replace('&quot;', '"')

print(f"Total chars: {len(text)}")
print("---FIRST 2000---")
print(text[:2000])
