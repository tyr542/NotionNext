# 煎餃的調味實驗室 — SEO / GEO 全站優化報告

> 產出日期：2026-02-28
> 分析工具：seo-audit、schema-markup、ai-seo、geo-content-optimizer、site-architecture

---

## 一、已完成的程式碼修改

### 1.1 blog.config.js
- LINK `http://gyozalab.com/` → `https://gyozalab.com`
- **影響範圍**：Sitemap、Canonical URL、og:url、所有 SEO 標記全部自動修正

### 1.2 components/SEO.js
- 新增 `<link rel="canonical" href={url} />`
- geo.region / geo.country 預設值 `CN` → `TW`
- og:image 預設值改為絕對路徑 `${LINK}/bg_image.jpg`
- Person Schema 加入 sameAs（自動從 contact.config.js 讀取社群連結）
- BlogPosting Schema 的 author 也使用完整的 authorSchema

### 1.3 lib/robots.txt.js
重寫為部分開放 AI 爬蟲策略：
- **開放**：GPTBot、ClaudeBot、PerplexityBot（允許被 AI 搜尋引擎引用）
- **封鎖**：Amazonbot、Google-Extended（封鎖 AI 訓練用途）
- 所有爬蟲封鎖 /api/、/_next/、/admin/、/private/

### 1.4 next-sitemap.config.js
- 加入 robotsTxtOptions policies（與 robots.txt.js 一致）
- 加入 RSS feed 作為額外 sitemap

### 1.5 PostHero.js
- 確認第 101 行已有正確的 `<h1>` 標籤 ✅ 無需修改

---

## 二、E-E-A-T 強化建議（需在 Notion 操作）

### Experience（經驗）

建議在 About 頁面新增「學習時間軸」區塊：

```
2025.09 — 零基礎開始接觸 AI
2025.10-11 — 以 iPAS 考試為框架系統化整理知識
2025.12 — 取得 iPAS AI 規劃師初級 + Google Gemini Educator
2026.01 — 參加 n8n 台北年會，探索 No-Code 自動化
2026.02 — 累積 17 篇文章，備考 iPAS 中級
```

建議新增「我每天在用的工具」區塊：
- Claude — 主力 AI 協作夥伴
- Obsidian — 第二大腦
- n8n — 自動化工作流
- Anti-Gravity — 部落格框架

### Expertise（專業）

建議新增「證照與認證」表格：

| 認證名稱 | 發照單位 | 取得時間 |
|---------|---------|---------|
| iPAS AI 應用規劃師（初級） | 經濟部產業發展署 | 2025.12 |
| Google Gemini Educator | Google for Education | 2025.12 |

建議新增「核心能力圈」：
- AI 基礎知識科普
- 非本科生的 AI 學習路徑設計
- 個人知識管理系統
- No-Code / Low-Code 自動化
- AI 證照備考策略

### Authoritativeness（權威性）

建議新增「精選推薦文章」區塊（同時增加內部連結）：
1. [iPAS AI 規劃師初級考試：筆記使用指南](/ipas-ai-complete-guide)
2. [寫 Prompt 之前，先學會問問題](/lyra-prompt-engineering)
3. [L113︱機器學習全景圖](/ipas-l113-ai-overview)
4. [《高效偷懶》讀書筆記](/be-lazy-fail-fast)

### Trustworthiness（可信度）

建議新增「內容政策」聲明：
- 所有文章由閃電煎餃本人撰寫，部分使用 AI 輔助
- 只推薦實際使用過的工具
- 定期回顧舊文章並標註更新日期
- 錯誤修正：來信 hi@gyozalab.com，48 小時內回覆

建議新增「免責聲明」：
- iPAS 筆記為個人學習記錄，以官方公告為準
- AI 工具功能以各官方文件為準
- 學習建議基於個人經驗，成效因人而異

---

## 三、網站架構優化

### 主題簇現狀

| 分類 | 文章數 | 成熟度 |
|------|--------|--------|
| 證照考試 | 9 篇 | 高 — 已有支柱頁面 |
| 讀書筆記 | 4 篇 | 中 — 需建支柱頁面 |
| AI 工具 | 2 篇 | 低 — 需累積更多文章 |
| 心得分享 | 1 篇 | 極低 |
| AI 協作 | 1 篇 | 極低 |

### 讀書筆記支柱頁面設計

**建議 URL**：`/reading-notes-guide`
**建議標題**：非本科生的 AI 時代書單：我讀過最值得的書和筆記整理

結構：
```
一、為什麼我要寫讀書筆記
二、生產力與思維方法論
   - 《高效偷懶》→ /be-lazy-fail-fast
   - 番茄工作法 → /pomodoro-anxiety-management
三、科技與大局觀
   - 《晶片戰爭》→ /chip-war-book-notes
四、資料思維與決策科學
   - 《大數據的關鍵思考》→ /big-data-thinking
五、延伸書單（待讀清單）
六、FAQ
七、建議閱讀順序
```

### 內部連結策略

每篇文章建議至少 3-5 個相關文章連結。重點補強：
- iPAS 子頁面：每篇底部加「返回總指南」連結
- iPAS 子頁面之間：加交叉連結（如 L113 機器學習 ↔ L114 生成式 AI）
- Gemini Educator：加入 iPAS 支柱頁面的連結地圖

---

## 四、內容缺口分析

### 嚴重不足的標籤

| 標籤 | 現有文章數 | 搜尋潛力 |
|------|-----------|---------|
| AI Agent | 1 篇 | 極高 |
| 提示詞工程 | 1 篇 | 極高 |
| 生成式AI | 2 篇 | 極高 |
| No-Code/n8n | 各 1 篇 | 高 |
| 知識管理 | 1 篇 | 中高 |

### 建議新文章主題 Top 10

| # | 標題 | 目標關鍵字 |
|---|------|-----------|
| 1 | 2026 年 AI Agent 完整入門指南 | AI Agent 入門 |
| 2 | n8n 自動化實戰：5 個每天在用的工作流 | n8n 教學 |
| 3 | Obsidian 知識管理系統：文組生的第二大腦 | Obsidian 教學 |
| 4 | Prompt Engineering 實戰手冊 | Prompt 教學 |
| 5 | Claude vs ChatGPT vs Gemini 2026 完整比較 | AI 工具比較 |
| 6 | 非本科生的 AI 自學路線圖 | AI 自學 |
| 7 | MCP 是什麼？AI Agent 的通訊協議 | MCP 教學 |
| 8 | AI 治理懶人包：台灣企業導入 AI 法規 | AI 治理 |
| 9 | 用 AI 輔助寫作的完整工作流 | AI 寫作 |
| 10 | Anti-Gravity 部落格架設心得 | No-Code 架站 |

---

## 五、FAQ Schema JSON-LD（可直接使用）

### About 頁面

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "閃電煎餃是誰？有什麼背景？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "閃電煎餃是「煎餃的調味實驗室」的作者，非本科文組背景（視覺媒體與歷史），自學 AI 並取得 iPAS AI 應用規劃師初級證照與 Google Gemini Educator 認證。專注於用白話文寫 AI 知識科普。"
      }
    },
    {
      "@type": "Question",
      "name": "這個網站的內容適合什麼程度的讀者？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "本站內容主要為 AI 初學者設計，特別適合非資工、非理工背景但對 AI 有興趣的讀者。文章以白話文撰寫，從基礎概念開始循序漸進。"
      }
    },
    {
      "@type": "Question",
      "name": "文章中的 AI 工具推薦是業配嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "本站所有文章均為自發性撰寫，沒有任何付費合作或聯盟行銷。推薦的工具都是作者實際使用並親身驗證過的。"
      }
    },
    {
      "@type": "Question",
      "name": "如何聯絡作者或回報文章錯誤？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "可以透過 Email（hi@gyozalab.com）或 Threads（@gyozalab）聯繫。如果發現文章中有事實錯誤，來信後將在 48 小時內回覆並視情況更正。"
      }
    }
  ]
}
```

### iPAS 支柱頁面

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "iPAS AI 規劃師初級考試難嗎？非本科生能考過嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "非本科文組背景準備約 2-3 個月可以通過。重點是建立系統化的知識框架，而不是死記硬背。本站提供的 7 篇筆記涵蓋初級考試 100% 核心範圍。"
      }
    },
    {
      "@type": "Question",
      "name": "這些筆記可以完全取代官方教材嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "建議以本站筆記作為主要學習框架（60-70%），搭配官方資源和時事追蹤（30-40%），特別是科目二的應用題需要關注最新案例。"
      }
    },
    {
      "@type": "Question",
      "name": "建議的讀書順序是什麼？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "建議依序：L111（人機協作）→ L112（資料處理）→ L113（機器學習）→ L114（生成式 AI）→ L121（No-Code）→ L122（AI Agent）→ L123（AI 導入策略）。"
      }
    }
  ]
}
```

### Person Schema（About 頁面增強版）

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "閃電煎餃",
  "alternateName": "Gyoza",
  "url": "https://gyozalab.com/about",
  "jobTitle": "AI 知識科普作者",
  "description": "非本科文組背景的 AI 自學者，專注於用白話文撰寫 AI 入門知識。",
  "email": "hi@gyozalab.com",
  "sameAs": [
    "https://www.threads.net/@gyozalab"
  ],
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "name": "iPAS AI 應用規劃師初級",
      "credentialCategory": "Professional Certificate",
      "recognizedBy": {
        "@type": "Organization",
        "name": "經濟部產業發展署"
      },
      "dateCreated": "2025-12"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "name": "Google Gemini Educator",
      "credentialCategory": "Professional Certificate",
      "recognizedBy": {
        "@type": "Organization",
        "name": "Google for Education"
      },
      "dateCreated": "2025-12"
    }
  ],
  "knowsAbout": [
    "人工智慧", "機器學習", "生成式 AI", "AI Agent",
    "提示詞工程", "No-Code 自動化", "知識管理"
  ]
}
```

---

## 六、robots.txt 策略說明

### 部分開放策略（已實作）

| 爬蟲 | 策略 | 原因 |
|------|------|------|
| GPTBot | 開放 | 讓 ChatGPT 能引用你的內容 |
| ClaudeBot | 開放 | 讓 Claude 能引用你的內容 |
| PerplexityBot | 開放 | 讓 Perplexity 能引用你的內容 |
| Amazonbot | 封鎖 | 主要用於 Alexa/Amazon 產品，無需開放 |
| Google-Extended | 封鎖 | Google AI 訓練用途，不影響搜尋排名 |

### 所有爬蟲共同封鎖
- `/api/` — API 路由
- `/_next/` — Next.js 內部資源
- `/admin/` — 管理頁面
- `/private/` — 私人內容

---

## 七、下一步行動清單

### ✅ 程式碼已完成（需部署）
- [ ] git commit 本次修改
- [ ] 重新 build 並部署到 Vercel
- [ ] 確認 Sitemap URL 使用 https
- [ ] 確認 robots.txt 反映新策略
- [ ] 到 Google Search Console 重新提交 Sitemap

### ⚠️ 需在 Notion 操作
- [ ] About 頁面：加入學習時間軸
- [ ] About 頁面：加入證照認證表格
- [ ] About 頁面：加入內容政策和免責聲明
- [ ] About 頁面：加入精選推薦文章
- [ ] iPAS 子頁面：每篇底部加「返回總指南」連結
- [ ] iPAS 子頁面之間：加交叉連結
- [ ] 建立讀書筆記支柱頁面
- [ ] 每篇文章補充圖片 Alt Text

### 📝 內容規劃
- [ ] 撰寫 AI Agent 入門指南
- [ ] 撰寫 n8n 自動化實戰教學
- [ ] 撰寫 Obsidian 知識管理系統
- [ ] 撰寫 Prompt Engineering 手冊

### 🎨 素材製作
- [ ] 製作品牌 og:image 封面圖（1200×630px）
- [ ] 考慮加入個人照片到 About 頁面
