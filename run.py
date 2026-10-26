# -*- coding: utf-8 -*-
"""
AgroAI - Serverni ishga tushirish skripti.
Port: 8000
Manzil: http://127.0.0.1:8000
"""

import sys
import os

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("  [AgroAI] O'simliklar Kasalliklarini Tasniflash Tizimi")
    print("  [URL] Server manzili: http://127.0.0.1:8000")
    print("=" * 60)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
