@echo off
rem Starts the NEXEN demo on http://127.0.0.1:8794/ wired to the owner's vector DB (G:) and vetted scripts (H:).
rem Missing folders are ignored: the demo falls back to its bundled sample.
set NEXEN_VECTOR_DIR=G:\My Drive\NEXEN_VECTOR_DB\jsonl-store\primary-70-data
set NEXEN_MODULES_DIR=H:\NEXEN_MODULES\_curated
set NEXEN_PORT=8794
"H:\NEXEN_RUNTIME\python-recovery\Scripts\python.exe" -B "%~dp0backend\server.py"
