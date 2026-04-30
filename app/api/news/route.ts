import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type NewsItem = {
  title: string;
  source: string;
  link: string;
  published: string;
  publishedAt: string;
  summary: string;
  category: string;
  ageDays: number;
};

function decodeHtml(input = "") {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripGoogleRedirect(url = "") {
  try {
    const u = new URL(url);
    const q = u.searchParams.get("url") || u.searchParams.get("q");
    if (q && /^https?:\/\//.test(q)) return q;
  } catch {}
  return url;
}

function removeEnglishNoise(text = "", source = "") {
  let s = decodeHtml(text);
  s = s.replace(/\s*-\s*Google News\s*$/i, "");
  s = s.replace(/\bRead more\b/gi, "");
  s = s.replace(/\bFull coverage\b/gi, "");
  s = s.replace(/\bView Full Coverage on Google News\b/gi, "");
  s = s.replace(new RegExp(`\\s*-\\s*${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i"), "");
  s = s.replace(/\s+/g, " ").trim();

  // ถ้าข้อความเป็นอังกฤษยาวเกินไป ให้ลดเหลือแค่พาดหัว/แหล่งข่าว ไม่ให้อ่านยืดยาว
  const thaiChars = (s.match(/[ก-ฮะ-์]/g) || []).length;
  const latinChars = (s.match(/[A-Za-z]/g) || []).length;
  if (latinChars > thaiChars * 2 && s.length > 90) {
    return "";
  }
  return s;
}

function titleClean(title = "", source = "") {
  let s = removeEnglishNoise(title, source);
  s = s.replace(/\s+-\s+[^-]{2,60}$/g, "").trim();
  return s || decodeHtml(title);
}

function tagCategory(text: string) {
  if (/แรงงาน|วีซ่า|ต่างชาติ|คนไทย|สถานทูต|e-9|e9|e-7|e7|eps|immigration|migrant|foreign worker|thai worker|work permit/i.test(text)) return "แรงงาน/คนไทยในเกาหลี";
  if (/เกาหลี|korea|seoul|won|president|รัฐบาล|เศรษฐกิจ|kospi|north korea|south korea|korean/i.test(text)) return "เกาหลีกระแส";
  if (/ไทย|thailand|bangkok/i.test(text)) return "ไทย";
  return "ข่าวเด่น";
}

function compactThaiSummary(title: string, desc: string, source: string, category: string) {
  const t = titleClean(title, source);
  const d = removeEnglishNoise(desc, source);
  let base = d;

  // ถ้า RSS snippet สกปรก/อังกฤษยาว ให้ทำ summary แบบสั้นจากหัวข้อแทน
  if (!base || base.length < 20) {
    if (category === "แรงงาน/คนไทยในเกาหลี") {
      base = "เป็นข่าวที่เกี่ยวกับแรงงานต่างชาติ คนไทยในเกาหลี วีซ่า หรือชีวิตคนต่างชาติในเกาหลี ควรเปิดต้นฉบับเพื่อตรวจรายละเอียดล่าสุด";
    } else if (category === "เกาหลีกระแส") {
      base = "เป็นข่าวกระแสในเกาหลีที่กำลังถูกพูดถึง ควรดูต้นฉบับเพื่ออ่านรายละเอียดเต็ม";
    } else {
      base = "เป็นข่าวเด่นที่น่าสนใจ ควรเปิดต้นฉบับเพื่ออ่านรายละเอียดเพิ่มเติม";
    }
  }

  base = base.replace(/\s+/g, " ").trim();
  if (base.length > 165) base = `${base.slice(0, 165).trim()}…`;
  return base;
}

function ageDaysFromPub(pub = "") {
  const date = pub ? new Date(pub) : new Date();
  const time = date.getTime();
  if (Number.isNaN(time)) return 999;
  return Math.max(0, Math.floor((Date.now() - time) / (24 * 60 * 60 * 1000)));
}

async function fetchGoogleNews(query: string, hl = "th", gl = "TH", ceid = "TH:th"): Promise<NewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  const res = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 0 },
    headers: { "User-Agent": "Mozilla/5.0 NongNamNewsBot/1.0" }
  });
  if (!res.ok) return [];
  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 16);

  return items.map((m) => {
    const item = m[1];
    const rawSource = decodeHtml(item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "Google News");
    const rawTitle = decodeHtml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
    const link = stripGoogleRedirect(decodeHtml(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || ""));
    const pub = decodeHtml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "");
    const desc = decodeHtml(item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "");
    const title = titleClean(rawTitle, rawSource);
    const category = tagCategory(`${title} ${desc} ${query}`);
    const ageDays = ageDaysFromPub(pub);

    return {
      title,
      source: rawSource,
      link,
      published: pub ? new Date(pub).toLocaleString("th-TH", { timeZone: "Asia/Seoul" }) : "",
      publishedAt: pub ? new Date(pub).toISOString() : "",
      summary: compactThaiSummary(title, desc, rawSource, category),
      category,
      ageDays
    };
  }).filter(x => x.title && x.link);
}

function uniqueItems(items: NewsItem[]) {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const item of items) {
    const key = item.title
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function score(item: NewsItem) {
  let s = 0;

  // ความใหม่สำคัญมาก
  if (item.ageDays <= 1) s += 120;
  else if (item.ageDays <= 3) s += 95;
  else if (item.ageDays <= 7) s += 65;
  else if (item.ageDays <= 14) s += 25;
  else s -= 120;

  // แรงงานไทยสำคัญ แต่ไม่ให้ข่าวเก่าแซงข่าวใหม่เกินไป
  if (item.category === "แรงงาน/คนไทยในเกาหลี") s += item.ageDays <= 14 ? 80 : -40;
  if (/แรงงานไทย|คนไทยในเกาหลี|สถานทูตไทย|วีซ่า|eps|e-9|e9|foreign worker|migrant worker/i.test(item.title + " " + item.summary)) s += 45;
  if (item.category === "เกาหลีกระแส") s += 20;
  if (/breaking|latest|ล่าสุด|วันนี้|ด่วน|ประกาศ|แถลง|เสียชีวิต|อุบัติเหตุ|รัฐบาล|ศาล|เลือกตั้ง|เศรษฐกิจ|เงินเฟ้อ|ค่าเงิน|ไฟไหม้|พายุ|ฝน|หิมะ/i.test(item.title + " " + item.summary)) s += 30;

  return s;
}

function diversify(items: NewsItem[]) {
  const fresh = items.filter(x => x.ageDays <= 14);
  const pool = fresh.length >= 8 ? fresh : items.filter(x => x.ageDays <= 30);
  const sorted = uniqueItems(pool).sort((a,b) => score(b) - score(a));

  const picked: NewsItem[] = [];
  const sourceCount = new Map<string, number>();
  const categoryCount = new Map<string, number>();

  for (const item of sorted) {
    const sc = sourceCount.get(item.source) || 0;
    const cc = categoryCount.get(item.category) || 0;

    if (sc >= 2) continue;
    // ไม่ให้ข่าวแรงงานเก่า ๆ กินพื้นที่ทั้งหมด
    if (item.category === "แรงงาน/คนไทยในเกาหลี" && cc >= 4) continue;
    if (item.category !== "แรงงาน/คนไทยในเกาหลี" && cc >= 5) continue;

    picked.push(item);
    sourceCount.set(item.source, sc + 1);
    categoryCount.set(item.category, cc + 1);
    if (picked.length >= 10) break;
  }

  return picked.length ? picked : sorted.slice(0, 10);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "ข่าวเด่น เกาหลีใต้ แรงงานไทย คนไทยในเกาหลี";
  const now = new Date();
  const day = now.toISOString().slice(0, 10);

  // ใช้ when: เพื่อบังคับความสดใหม่ และแยก query เพื่อให้เนื้อหาหลากหลายขึ้น
  const queries = [
    `${q} when:2d`,
    `ข่าวเด่น เกาหลีใต้ ล่าสุด when:2d`,
    `ข่าวเกาหลีใต้ วันนี้ when:2d`,
    `South Korea top news today when:2d`,
    `แรงงานไทย เกาหลี when:14d`,
    `คนไทยในเกาหลี ข่าว when:14d`,
    `แรงงานต่างชาติ เกาหลีใต้ วีซ่า when:14d`,
    `South Korea migrant workers visa when:14d`,
    `เศรษฐกิจเกาหลี ค่าเงินวอน when:7d`,
    `สถานทูตไทย เกาหลี ข่าว when:30d`
  ];

  const settled = await Promise.allSettled(queries.map(query => fetchGoogleNews(query)));
  const all = settled.flatMap(r => r.status === "fulfilled" ? r.value : []);
  const items = diversify(all);

  return NextResponse.json({
    query: q,
    generatedAt: day,
    count: items.length,
    items,
    note: "ข่าวถูกคัดจาก Google News RSS โดยเน้นข่าวสดและดันข่าวแรงงานไทย/คนไทยในเกาหลีเมื่อมีข่าวใหม่"
  });
}
