"""Repairs double-encoded UTF-8 emoji (UTF-8 bytes read as cp1252 and saved again) in one file.
Only mojibake runs that decode cleanly back to valid UTF-8 are touched. Usage: python fix_mojibake.py <file>
"""
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
raw = path.read_bytes()
text = raw.decode("utf-8")

rev = {}
for i in range(256):
    try:
        rev[bytes([i]).decode("cp1252")] = i
    except UnicodeDecodeError:
        rev[chr(i)] = i  # undefined in cp1252: the original byte survives as a C1 control char

run = re.compile(r"[ÃÂâð][\u0080-ÿŒœŠšŸŽžƒˆ˜–—‘-„†-•…‰‹›€™]{1,8}")
fixed = 0

def repair(m):
    global fixed
    s = m.group(0)
    try:
        b = bytes(rev[c] for c in s)
        out = b.decode("utf-8")
    except (KeyError, UnicodeDecodeError):
        return s
    fixed += 1
    return out

new = run.sub(repair, text)
if new != text:
    path.write_bytes(new.encode("utf-8"))
print(f"repaired {fixed} mojibake run(s) in {path.name}")
