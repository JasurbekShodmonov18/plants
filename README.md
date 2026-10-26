# 🌿 AgroAI — Chuqur O'qitish Algoritmlari Orqali O'simliklar Kasalliklarini Tasniflash

Ushbu loyiha **kompyuter ko'rishi (Computer Vision)** va **chuqur o'qitish (Deep Learning)** algoritmlaridan foydalangan holda qishloq xo'jaligi ekinlari barglaridagi kasalliklarni avtomatik tarzda aniqlash, tashxis qo'yish hamda agronomik davolash tavsiyalarini berishga mo'ljallangan to'liq veb-platformadir.

---

## 🌟 Loyiha Imkoniyatlari

1. **Tasvir orqali tezkor tashxis:**
   - Kompyuter yoki telefondan barg rasmini yuklash (Drag & Drop).
   - Jonli kamera (Webcam) orqali to'g'ridan-to'g'ri suratga olib tekshirish.
   - Bir marta bosish bilan sinash uchun oldindan tayyorlangan namunaviy barglar.

2. **38 xil holat va 14 ta ekin turi:**
   - Pomidor, Kartoshka, Olma, Makkajo'xori, Uzum, Shirin qalampir, Shaftoli, Gilos, Qulupnay, Qovoq, Soya va boshqalar.
   - Sog'lom holat hamda zamburug'li, bakterial va virusli kasalliklar.

3. **To'liq Agronomik Xulosa:**
   - Aniqlangan kasallik va uning lotincha ilmiy patogen nomi.
   - Kasallik xavflilik darajasi (O'ta xavfli, Jiddiy, O'rta, Sog'lom).
   - Modelning ishonch darajasi (Confidence score, %).
   - **Alomatlar:** bargdagi o'zgarishlar tavsifi.
   - **Sabablar:** harorat, namlik va tarqalish omillari.
   - **Agro-retsept:** tavsiya etiladigan samarali fungitsidlar/bakteritsidlar va davo choralari.
   - **Profilaktika:** kelgusida kasallik tarqalishining oldini olish bo'yicha ko'rsatmalar.

4. **Interaktiv O'simliklar Ensiklopediyasi:**
   - 38 xil kasallik bo'yicha qidiruv va ekinlar bo'yicha filtrlash.
   - Har bir kasallik kartasini ochib, to'liq ma'lumotlarni o'rganish imkoniyati.

---

## 🏗️ Tizim Arxitekturasi

```
plants/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI server va REST API marshrutlari
│   ├── ml_engine.py         # Chuqur o'qitish va Kompyuter ko'rishi inference moduli
│   ├── disease_database.py  # 38 xil kasallik bo'yicha to'liq agronomik ma'lumotlar bazasi
│   └── models/              # Neyron to'ri vaznlari (.onnx)
├── static/
│   ├── css/style.css        # Zamonaviy zamonaviy dizayn, dark/light rejim, animatsiyalar
│   ├── js/app.js            # Kamera, fayl yuklash, tahlil va modal oynalar logikasi
│   └── images/samples/      # Tezkor sinov namunalari
├── templates/
│   └── index.html           # Veb-ilova sahifasi
├── scripts/
│   ├── prepare_samples.py   # Namuna rasmlarni generatsiya qilish/yuklash
│   └── train_model.py       # PyTorch (MobileNetV2/ResNet) o'qitish va ONNX eksport skripti
├── run.py                   # Serverni 1 bosish bilan ishga tushiruvchi skript
└── requirements.txt         # Kerakli Python kutubxonalari
```

---

## 🚀 Loyihani Ishga Tushirish

### 1. Talablar:
- Python 3.10+ (Python 3.11 tavsiya etiladi)

### 2. Kutubxonalarni o'rnatish:
```bash
pip install -r requirements.txt
```

### 3. Serverni ishga tushirish:
```bash
python run.py
```
Brauzerda quyidagi manzilni oching:
👉 **http://127.0.0.1:8000**

---

## 🧠 Modelni O'qitish (Training)

Agar sizda [PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease) yoki o'zingiz to'plagan yangi dataset bo'lsa, modelni quyidagicha o'qitishingiz mumkin:

```bash
python scripts/train_model.py --data_dir "/path/to/dataset" --epochs 15 --batch_size 32
```
O'qitilgan model avtomatik ravishda `app/models/plant_disease_model.onnx` formatiga eksport qilinadi va veb-sayt darhol yangi model orqali ishlay boshlaydi.
