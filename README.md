# Nong Nam AI Companion — v4 Stable Clean Build

เวอร์ชันนี้เป็น clean stable build ทำใหม่เพื่อ deploy ง่ายบน Vercel

## จุดสำคัญ
- Next.js app router
- ไม่มี Supabase dependency
- ไม่มี OpenAI dependency ในรอบ MVP นี้
- รูปอยู่ใน public/assets
- Owner mode มีจริง
- เพชรเจ้าของเป็น ∞ OWNER
- ชุดหญิง 12 ช่อง / ชาย 3 ช่อง / 20+ 6 ช่อง
- 20+ และ placeholder จะเบลอก่อนปลดล็อก
- ชั้นหนังสือใช้ browser TTS
- ปุ่ม quick actions ใช้ได้
- ปุ่มเปิดเสียงสำหรับมือถือ

## วิธีเปิด owner mode
1. เข้า Settings
2. แตะ Version ด้านล่าง 5 ครั้ง
3. ใส่ PIN: 2468
4. จะขึ้น OWNER MODE และเพชรเป็น ∞ OWNER

## วิธีแทนรูป
แทนไฟล์ใน public/assets/outfits เช่น:
- public/assets/outfits/female/f_001_chat.jpg
- public/assets/outfits/female/f_001_book.jpg

แล้ว commit ขึ้น GitHub

## Vercel settings
- Framework Preset: Next.js
- Root Directory: ว่าง หรือ ./
- Output Directory: Next.js default
- Build Command: npm run build
- Install Command: npm install


## v4.1 TypeScript hotfix
- Fixed TypeScript literal type error for ChatMsg.role in app/page.tsx
- Vercel build error at app/page.tsx:310 should be resolved


## v4.2 gender hotfix
- Replaced welcome female/male cards with selected real pair images
- Removed duplicate gender selector from setup page
- Male companion now replies with masculine Thai particles such as ครับ
- Male TTS pitch is lower and tries to select a male Thai voice when available
- Book request opens bookshelf and replies with gender-matched particle


## v4.3 books + owner patch
- Female now has 2 free outfits by default (f_001, f_002)
- Male extra outfit slots use placeholder cards instead of female photos
- Bookshelf expanded with many categories and books
- Saying/typing about reading books opens bookshelf and prompts category selection
- Settings for normal users only show reset profile and clear chat
- Owner controls remain hidden behind version tap / PIN and test gems add +10000
- Voice reply is on by default and can be toggled in chat or owner settings


## v4.5 admin outfits + compressed uploads
- Welcome female card uses room-style image, while Level 1 remains the black-background outfit
- Added Owner exit button to preview normal user mode without resetting gems
- Added Outfit Admin for editing outfit title, desc, price, lock status, chat image, and book image
- Outfit uploads are compressed client-side before saving
- Book cover upload now compresses/crops to 300x400 before saving
- Book Admin supports edit/cancel edit, delete, and test-read
- Version trigger is smaller and less visible


## v4.6
- hidden tiny version button
- owner tools inline inside settings
- outfit upload/edit inline
- book admin inline with edit/delete/test
- compressed image uploads
- lighter blur for regular outfits and stronger blur for 20+


## v4.7 click book read fix
- Whole book card is clickable, not only the small button.
- Added visible "tap to read" hint on book cards.
- Split long book text into smaller Web Speech chunks for mobile TTS stability.
- If a book has no text, assistant tells the user instead of doing nothing.


## v4.8 book details + speed + adult category
- Book cards now show title, category, author, teaser, price, and 20+ badge.
- Adult books are forced into the erotic 18+ category when saved.
- Entering the 18+ category shows a 20+ confirmation popup.
- Reading an adult book also shows a 20+ confirmation popup.
- Added reader speed controls: 0.8x / 1x / 1.25x / 1.5x / 1.75x.
- TTS reading uses the selected speed.


## v4.9 reading controls + alive motion
- Pause/resume/stop reading controls.
- Remembers book reading position in localStorage across reloads.
- Chat commands: หยุดอ่าน / อ่านต่อ / เปลี่ยนเล่ม.
- Speed controls shown in bookshelf and reading panel.
- Character image gets subtle alive motion while speaking/reading.
- Default female level 1 image replaced with dark rim-light portrait.
- Adult category confirmation popup added.


## v5.0 API Ready
Added `/api/chat` endpoint.

### Vercel Environment Variables
Required for real AI chat:
- `OPENAI_API_KEY` = your OpenAI API key

Optional:
- `OPENAI_MODEL` = `gpt-4.1-mini` by default

If `OPENAI_API_KEY` is missing, the app will not crash. It will use local fallback replies.
Reading books still uses browser TTS and does not call API.


## v5.3.1 Lockfile-only Vercel fix

This ZIP is prepared to fix Vercel's `npm install` / `next: command not found` issue.

What changed:
- package.json pins Next.js 14.2.25, React 18.3.1, ReactDOM 18.3.1
- package-lock.json is included
- vercel.json forces `npm ci --legacy-peer-deps --no-audit --no-fund`
- .npmrc reinforces stable npm behavior
- UI, images, books, outfits, owner mode, and assets are preserved

Vercel variables:
- OPENAI_API_KEY
- OPENAI_MODEL=gpt-4.1-mini

Upload all files from the root of this ZIP into the GitHub repo root.


## V6.1 Book Intent Fix
- ถ้าผู้ใช้พูดว่าอ่านหนังสือ / เล่านิทาน / ฟังหนังสือ / มีหนังสืออ่านไหม ระบบจะเปิดหน้าชั้นหนังสือทันที
- AI จะไม่ตอบว่าอ่านไม่ได้อีก
- ข้อความเชิญเลือกหนังสือจะใช้สรรพนามตามที่ตั้งค่า เช่น เมีย/ผัว หรือ ผม/ครับ
- เมื่อเลือกเล่ม ระบบใช้ฟังก์ชันอ่านหนังสือเดิมของแอป


## V6.2 News Mode
- เพิ่ม API `/api/news` สำหรับดึงข่าวจาก Google News RSS
- ถ้าผู้ใช้ถาม "ข่าววันนี้ / ข่าวช่วงนี้ / ข่าวแรงงานไทย / ข่าวเกาหลี" ระบบจะเปิดหน้า "ข่าววันนี้"
- ดันข่าวที่เกี่ยวกับแรงงานไทย คนไทยในเกาหลี แรงงานต่างชาติ วีซ่า และสถานทูตขึ้นก่อน
- ข่าวพาดหัวใช้ 3 เพชร
- ปุ่ม "เจาะข่าวนี้" ใช้ 5 เพชร และส่งข่าวนั้นให้ AI เล่าแบบเข้าใจง่าย
- ไม่แต่งข่าวเอง ถ้าข่าวไม่มีแหล่งที่มา จะไม่สร้างเป็นเรื่อง


## V6.2.1 Compile Fix
- แก้ TypeScript build error ใน app/api/news/route.ts
- เอา regex flag `s` ออก เพราะ Vercel/tsconfig target เดิมยังไม่รองรับ dotAll regex flag
- เปลี่ยนเป็น `[\s\S]` เพื่อทำงานเหมือนเดิมโดยไม่พังตอน build

## V6.3 News Summary UI
- เปลี่ยนปุ่มข่าวจาก "เจาะข่าวนี้" เป็น "สรุปข่าวนี้ให้ฟัง"
- กดแล้วไม่เด้งกลับหน้าแชต แต่ให้น้องน้ำสรุปข่าวสั้น ๆ จากพาดหัว/คำอธิบายข่าวทันที
- ไม่ใช้ AI เจาะลึกยาว ลดการใช้โทเค็น
- มีปุ่ม "อ่านต้นฉบับ" แยกไว้ให้เปิดข่าวจริงเอง
- ปรับหน้าข่าวให้โล่งขึ้น: พาดหัว, หมวด, แหล่งข่าว, สรุป 2 บรรทัด, ปุ่มสรุป/อ่านต้นฉบับ


## V6.3.1 News Speak Fix
- กด “สรุปข่าวนี้ให้ฟัง” แล้วกลับไปหน้าแชต
- แสดงข้อความสรุปข่าว
- บังคับอ่านออกเสียงทันทีด้วย `forceSpeak()`
- ไม่พึ่งค่า voiceUnlocked เพราะผู้ใช้กดให้ฟังโดยตรง


## V6.3.2 News Audio Gesture Fix
- แก้ปัญหา Safari/iPhone/Mac ไม่ยอมอ่านเสียงถ้าเรียก speech หลัง setTimeout
- ปุ่ม “สรุปข่าวนี้ให้ฟัง” จะเรียก `forceSpeak()` ทันทีในจังหวะกดปุ่ม
- เพิ่ม retry/resume สำหรับ Safari ที่ speechSynthesis ชอบ pause เอง
- ถ้าเสียงไม่ออกจะแจ้งให้แตะซ้ำ/ตรวจเสียงเครื่อง


## V6.3.3 Global Audio Unlock
- แก้เสียงทั้งแอป ไม่ใช่เฉพาะข่าว
- `sendAssistant()` ใช้ `forceSpeak()` โดยตรงเมื่อเปิดเสียง
- เพิ่มปุ่ม “แตะเพื่อเปิดเสียงน้องน้ำ” ในหน้าแชตเพื่อปลดล็อก Safari/iPhone/Mac
- `speak()` ตัวเก่าถูกเปลี่ยนให้เรียก `forceSpeak()` แทน
- ปุ่มเปิด/ปิดเสียงใน settings ใช้ระบบเดียวกัน


## V6.4 News Fresh Clean
- ปรับ `/api/news` ให้ใช้ `when:2d / when:7d / when:14d` เพื่อดันข่าวสดก่อน
- ลดการดันข่าวแรงงานเก่า ๆ ถ้าไม่มีอัปเดตใหม่
- เพิ่มความหลากหลายของข่าว: ข่าวเด่นเกาหลี ข่าวแรงงาน/วีซ่า เศรษฐกิจ ค่าเงิน และข่าวคนไทยในเกาหลี
- ทำความสะอาด Google News RSS ไม่อ่าน `Read more`, `Google News`, HTML, หรือ snippet ภาษาอังกฤษยาว ๆ
- สรุปข่าวที่อ่านให้ฟังเหลือสั้น กระชับ: เกิดอะไรขึ้น + แหล่งข่าว
- ปรับหน้าข่าวให้โล่งขึ้น ปุ่มสั้นขึ้น: “สรุปให้ฟัง” / “ต้นฉบับ”


## V6.4.2 Living Companion Patch
- แก้ API chat ไม่ต้องบังคับ externalId แล้ว
- แก้ prompt ให้ปลอดภัยขึ้น: โรแมนติก/งอน/หึงได้ แต่ไม่ explicit
- แก้ bubble: ข้อความล่าสุดชัด ข้อความเก่าจางขึ้นด้านบน ไม่ใช่ข้อความใหม่จางหาย
- แก้สรุปข่าวไม่อ่านเสียงซ้ำสองรอบ
- แก้ regex เก็บความจำที่เคย escape ผิด
- เพิ่ม relationship learning: affection/trust/jealousy/romance
- เพิ่ม local reply แบบมโนชีวิตตัวละคร เช่น กินข้าว/ไปตลาด/อยู่บ้าน
- เพิ่ม reaction เวลาแฟนเก่า/เพื่อน/ชื่อคนอื่นถูกพูดถึงตามบริบท
- เพิ่ม animation ตอนพูดให้ตัวละครดุ๊กดิ๊กชัดขึ้น
- เอาไฟล์ zip ซ้อนขนาดใหญ่เกิน 100MB ออกจากแพ็กใหม่ เพื่อให้ push GitHub/Vercel ได้ง่าย
