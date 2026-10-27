# -*- coding: utf-8 -*-
"""
FastAPI Veb-Serveri:
- REST API (Tasvir yuklash va AI tahlil)
- O'simlik kasalliklari ensiklopediyasi
- Statik fayllar va veb-interfeys
"""

import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.requests import Request

from app.ml_engine import classifier
from app.disease_database import DISEASE_INFO, DISEASE_CLASSES

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

app = FastAPI(
    title="AgroAI - O'simliklar kasalliklarini tasniflash",
    description="Chuqur o'qitish va Kompyuter Ko'rishi orqali o'simlik barglari kasalliklarini aniqlash tizimi",
    version="1.0.0"
)

# Statik fayllar va shablonlar
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Bosh sahifa: rasm yuklash va jonli tashxis interfeysi."""
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "total_classes": len(DISEASE_CLASSES),
            "total_plants": len(set(d["plant"] for d in DISEASE_INFO.values()))
        }
    )


@app.post("/api/predict")
async def predict_plant_disease(file: UploadFile = File(...)):
    """
    Foydalanuvchi yuklagan barg rasmini qabul qilib,
    chuqur o'qitish modeli orqali kasallikni aniqlaydi.
    """
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Faqat rasm fayllari (JPG, PNG, WEBP) qabul qilinadi.")
    
    try:
        contents = await file.read()
        if len(contents) > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Rasm hajmi 15MB dan oshmasligi kerak.")
        
        result = classifier.predict(contents, filename=file.filename or "")
        if not result.get("is_plant", True):
            return JSONResponse(content={
                "success": False,
                "is_plant": False,
                "error": result.get("error", "Yuklangan rasmda ösimlik bargi aniqlanmadi!"),
                "reason": result.get("reason", ""),
                "metrics": result.get("metrics", {})
            })

        return JSONResponse(content={"success": True, "is_plant": True, "data": result})
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "is_plant": False, "error": f"Tahlil jarayonida xatolik yuz berdi: {str(e)}"}
        )


@app.get("/api/diseases")
async def get_all_diseases():
    """Tizim taniydigan barcha 38 ta kasallik va o'simliklar ensiklopediyasi."""
    items = []
    for class_id, info in DISEASE_INFO.items():
        items.append({
            "class_id": class_id,
            **info
        })
    return {"total": len(items), "diseases": items}


@app.get("/api/plants-list")
async def get_plants_list():
    """Mavjud ekinlar ro'yxati (Filtrlash uchun)."""
    plants = sorted(list(set(info["plant"] for info in DISEASE_INFO.values())))
    return {"plants": plants}
