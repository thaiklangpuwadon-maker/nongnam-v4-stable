# 🌸 Nong Nam Companion — v7

**v7 = v5 base + IndexedDB Memory + Affection Engine + Auto Fact Extraction**

---

## ✨ สิ่งใหม่ใน v7 (เทียบกับ v5)

| ฟีเจอร์ | v5 | v7 |
|---|---|---|
| Build บน Vercel | ❌ พัง (Next 15 + React 19) | ✅ ผ่าน (Next 14.2.25 + React 18.3.1) |
| คุยกับ AI จริง | ❌ ใช้ scripted reply | ✅ เรียก `/api/chat` พร้อม memory |
| จำชื่อ/อายุ/รสนิยม | ❌ ไม่มี | ✅ Auto-extract จากแชต → IndexedDB |
| จำเวลาเบรค/เลิกงาน | ❌ ไม่มี | ✅ จับจาก "พักเที่ยง" "เลิก 6 โมง" อัตโนมัติ |
| ระดับความรัก | ❌ ไม่มี | ✅ 5 ระดับ (0-100) ค่อยๆ ขึ้นจากแชต |
| บุคลิกตามคำเรียก | ❌ คงที่ | ✅ "ที่รัก"=แฟน, "ผัว"=เมีย, "พี่"=elder |
| หึงเมื่อพูดถึงคนอื่น | ❌ ไม่มี | ✅ Mention tracking (ใน prompt) |
| Storage | localStorage | IndexedDB (ไม่จำกัด) + localStorage (legacy) |

---

## 🚀 วิธี Deploy

### 1. Upload ไฟล์ทั้งหมดไป GitHub
ลากไฟล์ root ทั้งหมดทับใน repo เดิม (`nongnam-clean-rebuild` หรือสร้างใหม่ก็ได้)

### 2. Vercel Settings
- **Framework Preset:** Next.js (auto)
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build` (default)
- **Install Command:** `npm install --legacy-peer-deps --no-audit --no-fund`

### 3. Environment Variables (Vercel → Project → Settings → Environment Variables)
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini       # optional, default = gpt-4.1-mini
```

### 4. Redeploy → ใช้งานได้

---

## 🔑 วิธีเข้า Owner Mode (เพชร ∞)
1. เข้าหน้า **Settings**
2. **แตะ Version ด้านล่าง 5 ครั้ง**
3. ใส่ PIN: **2468**
4. เพชรกลายเป็น `∞ OWNER` + ปลดล็อกทุกชุด

---

## 🧠 ระบบ Memory ทำงานยังไง

ทุกครั้งที่พี่พิมพ์ข้อความ:

1. **Extract Facts** — regex จับชื่อ, อายุ, อาชีพ, รสนิยม, เวลาเบรค
2. **Save IndexedDB** — เก็บในเครื่องผู้ใช้ (ไม่ส่ง server)
3. **Detect Interaction Type** — casual / warm / intimate / explicit / hurt
4. **Update Affection** — ค่อยๆ +1 ถึง +4 ตามประเภท
5. **Build System Prompt** — ใส่ทุก fact + schedule + affection ลง prompt
6. **Call OpenAI** — AI ตอบกลับโดยรู้ทุกอย่างเกี่ยวกับพี่

### ตัวอย่าง: สิ่งที่ AI จะเห็น
```
== บุคลิกและกฎการตอบ ==
1. บทบาท: เป็นเมียที่สนิท หวงมาก ห่วงใยทุกเรื่อง...
2. เรียกผู้ใช้ว่า "ผัว"
3. ระดับความสนิทตอนนี้: คนรัก (75/100)
4. ตอนนี้รักกันมาก — เปิดใจเต็มที่ แซวได้

== สิ่งที่จำได้เกี่ยวกับผัว ==
- real_name: แมน
- age: 27
- job: ฟรีแลนซ์
- favorite_food: ส้มตำ

== ตารางเวลาประจำของผัว ==
- พักเที่ยง: 12:00
- เลิกงาน: 18:00
```

---

## 🗂 โครงสร้างไฟล์

```
.
├── app/
│   ├── api/chat/route.ts      ← เรียก OpenAI พร้อม memory
│   ├── page.tsx               ← UI หลัก (v5 base + memory integration)
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── memoryDB.ts            ← IndexedDB wrapper
│   ├── affectionEngine.ts     ← 5 ระดับความรัก
│   ├── factExtractor.ts       ← regex extract ข้อมูลจากแชต
│   └── relationshipDetector.ts ← detect บุคลิกจากคำเรียก
├── public/assets/             ← รูปคงเดิมทั้งหมด
├── package.json               ← Next 14.2.25 + React 18.3.1 (เสถียร)
├── .npmrc                     ← legacy-peer-deps
├── vercel.json                ← install command พร้อม flags
└── README.md
```

---

## 🐛 Troubleshooting

### Build พังบน Vercel?
- เช็ค Vercel logs → ถ้าเจอ "next: command not found" → npm install ไม่ทำงาน
- ลองเปลี่ยน Install Command เป็น: `npm install --legacy-peer-deps --no-audit --no-fund`
- หรือลบ `package-lock.json` ใน GitHub repo แล้ว redeploy

### AI ตอบไม่ได้?
- เช็คว่าตั้ง `OPENAI_API_KEY` ใน Vercel → Environment Variables
- ตรวจ credit OpenAI account
- ถ้าไม่มี API key → ระบบจะ fallback เป็น scripted reply อัตโนมัติ (ไม่พัง)

### Memory ไม่จำ?
- เปิด DevTools → Application → IndexedDB → `nongnam_memory_v1` → ดู stores
- ถ้าใช้ Safari iOS → เช็ค "Prevent Cross-Site Tracking" ปิดอยู่
- iOS Safari บางครั้ง clear IndexedDB หลัง 7 วันไม่ใช้ → แนะนำ "Add to Home Screen"

---

## 📝 Phase ถัดไป (v8)

- 🔮 Smart Wardrobe — น้องน้ำอ้อนซื้อชุดตามบริบท
- 🔮 Mood Analyzer — ตรวจจับอารมณ์ผู้ใช้แม่นขึ้น
- 🔮 Push Notification — ทักก่อนแม้ปิดแอป (PWA + Service Worker)
- 🔮 Backup/Restore — export/import IndexedDB เป็น JSON

---

**Version:** 7.0.0
**Built on:** v5.2 base
**Build status:** ✅ `npm run build` ผ่าน (tested)
