import json
from pathlib import Path
p = Path(r"c:\Users\Jack Mathew\OneDrive\Desktop\hack\schemes.json")

def remove_contacts(obj):
    if isinstance(obj, dict):
        if 'contact' in obj:
            obj.pop('contact')
        for v in obj.values():
            remove_contacts(v)
    elif isinstance(obj, list):
        for item in obj:
            remove_contacts(item)


data = json.loads(p.read_text(encoding='utf-8'))
remove_contacts(data)
p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print('Removed contact fields from', p)
