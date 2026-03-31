#!/usr/bin/env python3
"""
EMERGENCY: Remove Git Merge Conflict Markers from ALL files
"""
import os
import re
from pathlib import Path

def remove_merge_conflicts(content):
    """Remove Git merge conflict markers, keeping HEAD version"""
    # Remove complete conflict blocks
    pattern = r'<<<<<<< HEAD\n.*?=======(\n.*?)?>>>>>>> [a-f0-9]+.*?(\n|$)'
    cleaned = re.sub(pattern, '', content, flags=re.DOTALL)
    
    # Clean up any orphaned markers
    cleaned = re.sub(r'<<<<<<< HEAD\n?', '', cleaned)
    cleaned = re.sub(r'=======(\n.*?)?>>>>>>> [a-f0-9]+.*?(\n|$)', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'>>>>>>> [a-f0-9]+.*?(\n|$)', '', cleaned)
    
    return cleaned

def main():
    extensions = ['.js', '.ts', '.html', '.css', '.json', '.md', '.txt', '.py', '.yaml', '.yml']
    skip_dirs = {'.git', 'node_modules', 'venv', '__pycache__', 'dist', 'build'}
    
    fixed = 0
    scanned = 0
    
    for ext in extensions:
        for filepath in Path('.').rglob(f'*{ext}'):
            if any(part in skip_dirs for part in filepath.parts):
                continue
            
            scanned += 1
            if scanned % 100 == 0:
                print(f"Scanned {scanned} files...")
            
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                if '<<<<<<< HEAD' not in content:
                    continue
                
                conflict_count = content.count('<<<<<<< HEAD')
                cleaned = remove_merge_conflicts(content)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(cleaned)
                
                fixed += 1
                print(f"✅ FIXED: {filepath} ({conflict_count} conflicts)")
                
            except Exception as e:
                print(f"❌ ERROR: {filepath}: {e}")
    
    print(f"\n{'='*60}")
    print(f"SCANNED: {scanned} files")
    print(f"FIXED: {fixed} files")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()