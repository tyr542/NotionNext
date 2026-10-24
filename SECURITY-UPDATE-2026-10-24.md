# Blog 資安與上游更新盤點（2026-10-24）

分支：`security/2026-10-deps-hardening`（兩個 commit：`272f7abe` 資安修正、`0e59412a` 套件升級）
狀態：本機正式模式建置與實測通過，**還沒合併到 main、還沒部署**。

---

## 你要做的事（依急迫度）

1. **換掉 `CACHE_TOKEN`**：舊值從 2026-04 起寫在 `.env.example`，跟著公開 repo 一起外流。到 Zeabur 設一個新的隨機字串（沒設也安全，`/api/cache` 會一律回 503）。
2. **合併分支並部署**：線上 `gyozalab.com` 現在仍是 Next.js 14.2.30，`/_next/image` 實測會幫任何外部網址處理圖片，正好踩在 Next.js 圖片最佳化的遠端執行漏洞上。合併後線上才會關掉。
3. **重新授權 Zeabur MCP**：這次查線上環境變數時回 401（權杖失效），所以沒能確認線上有沒有設 `CACHE_TOKEN`。

---

## 一、NotionNext 上游更新（你的 fork 停在 v4.9.4，上游已到 v4.11.1，差 830 個提交）

### 已經自己補上的（這次分支做了）

| 上游項目 | 上游版本 | 這次做法 |
|---|---|---|
| Next.js 升到 15.5.x | v4.11.0 | 直接升 15.5.28 |
| `/api/cache` 必須帶權杖 | v4.11.0 | 改成沒設權杖就回 503，支援 `Authorization: Bearer` |
| Notion OAuth 不再把 token 放進網址和 log | v4.11.0 | 回呼只回成功或失敗，不再記錄 token |
| 非本站 Notion 工作區頁面回 404 | v4.11.0 | 兜底渲染前比對 `space_id`，可用 `NOTION_WORKSPACE_ID` 指定 |
| 依賴安全修補（resolutions） | v4.11.0 | 照抄上游 resolutions 再補幾個 |
| 分享 SVG 不經 Next/Image 最佳化 | v4.10.10 | 整個關掉 `/_next/image`（Hexo 主題沒用到） |

### 值得之後挑來用的

- **文章密碼改伺服器端驗證**（v4.11.1）：你現在的加密文章，內容和密碼雜湊都在頁面資料裡送到瀏覽器，懂一點技術的人看得到原文。你有用加密文章才需要處理。
- **`file.notion.com` 新圖片網址適配**（v4.11.0）：Notion 若全面換新圖片網域，你的 `/api/image` 白名單要加這個網域。
- **首頁與列表頁只送文章摘要**（v4.10.0）：你 07-15 自己做過類似效能調整，上游版本可以對照。
- **SEO canonical 修正、Notion Heading 4、Collection View 排序**（v4.10.5）。
- **內嵌子頁面網址跟隨父路徑**（v4.10.10，選用設定）。

### 不需要的

- 其他主題（heo、Fuwari、Proxio、opc、XuHome 等）的修正：你用 Hexo。
- NotionComments 評論、PWA、Content MCP、Supabase、vitepress 文件站：新功能，跟資安無關。
- 不蒜子改 Vercount、預設不載中文 Web Font：你已改用 GA4 統計和自架字型。

### 待你決定：要不要整包合併上游？

整包合併要處理 830 個提交，跟你自訂的熱區（圖片代理、GA4 注入、Hexo 主題、Notion 資料擷取）一定會衝突，是一個獨立的大工程。這次選擇只挑資安相關的部分自己補。

---

## 二、Blog 架構資安檢查

| # | 問題 | 嚴重度 | 狀態 |
|---|---|---|---|
| 1 | `/_next/image` 開放代理任何網址，且開了 `dangerouslyAllowSVG`，搭配 Next 14.2.30 的圖片最佳化遠端執行漏洞 | 嚴重 | ✅ 已修：`images.unoptimized`、限縮 `remotePatterns`、關 SVG |
| 2 | `CACHE_TOKEN` 真實值寫在公開的 `.env.example` | 高 | ✅ 已從檔案移除；⚠️ 你要到 Zeabur 換新值 |
| 3 | `/api/cache` 沒設權杖時任何人都能清快取 | 高 | ✅ 已修：沒設就 503，比對改成定時比較 |
| 4 | 任何公開 Notion 頁面 ID 都能掛在 gyozalab.com 底下顯示（可被拿來做釣魚頁） | 高 | ✅ 已修：非本站工作區一律 404 |
| 5 | Notion OAuth 回呼把存取權杖放進跳轉網址與 log | 中 | ✅ 已修（線上沒設 OAuth，原本就跑不到） |
| 6 | 安全標頭全被註解掉 | 中 | ✅ 已補 `nosniff`、`X-Frame-Options`、`Referrer-Policy`、`Permissions-Policy`；HSTS 由 Cloudflare 提供 |
| 7 | CORS 開了 `Allow-Credentials` 與 PUT/DELETE/PATCH | 低 | ✅ 已收成 GET/POST/OPTIONS、拿掉 credentials |
| 8 | 訂閱 API 把錯誤物件原樣回給前端 | 低 | ✅ 已修 |
| 9 | 加密文章的內容在瀏覽器端看得到 | 中（有用才算） | ⏸ 未修，見上一節 |
| 10 | 沒有內容安全政策（CSP） | 低 | ⏸ 未開：Notion 內嵌和第三方腳本多，要逐一盤點來源 |
| 11 | Clerk 登入套件留著但沒啟用（`/api/user` 線上回 500） | 低 | ⏸ 建議之後整組移除，順便清掉剩下的 Clerk 漏洞 |

### 順手修到的舊問題

- 07-15 那次效能調整把 `processPostData`（文章頁的上下篇、推薦文等後處理）匯入到錯的檔案，之後每次建置這段都靜默失敗（建置 log 有 29 次錯誤）。已改回 `lib/utils/post-server.js`，測試的 mock 也一起修。
- **部署後畫面會變**：線上文章頁目前沒有「上一篇／下一篇」和推薦文章（實測 `agent-skills-guide` 這三欄都是空的），修好後會重新出現。每篇文章頁資料多約 10 KB，`page-data-budget` 檢查通過。

---

## 三、套件漏洞掃描與更新（`yarn audit`）

| | 升級前 | 升級後 |
|---|---|---|
| 嚴重（critical） | 6 | **0** |
| 不重複漏洞 | 131 | 24 |
| 會跑在線上的漏洞 | 幾十個（next、axios、sharp、grpc、protobufjs⋯） | 1 個（`@clerk/clerk-react`，網站沒啟用 Clerk，碰不到） |

> `yarn audit` 的總筆數（443 → 311）是按「每條相依路徑」算的，同一個 eslint 漏洞會被算上百次，看不重複漏洞數比較準。

### 主要升級

| 套件 | 舊版 | 新版 | 為什麼 |
|---|---|---|---|
| `next` | 14.2.30 | 15.5.28 | 三個遠端執行漏洞只修在 15.5.24 以上 |
| `@clerk/nextjs` | 5.7.5 | 5.7.6 | middleware 繞過漏洞 |
| `axios` | 1.10.0 | 1.20.0 | 20 幾個原型污染、SSRF 漏洞 |
| `sharp` | 0.34.5 | 0.35.5 | libvips / libheif / librsvg 漏洞 |
| `@google-analytics/data` | 5.2.1 | 7.3.0 | 底下的 grpc-js、protobufjs 漏洞 |
| resolutions | 1 條 | 21 條 | form-data、follow-redirects、postcss、nanoid、lodash 等遞移相依 |

### 刻意沒升的

- **Next.js 16**：上游也停在 15.5.x，16 版改動大，等上游先走。
- **`@clerk/clerk-react` 強制升 5.61**：試過，跟 `@clerk/nextjs` 5.7.6 不相容、建置失敗，已撤回。網站沒啟用 Clerk，碰不到這個漏洞。
- **`notion-client` / `react-notion-x` 7.12.1**：沒有資安公告，屬功能更新，跟你的 patch 綁在一起，留給合併上游時一起處理。
- **剩下的漏洞**：全在 eslint、jest、tailwind 這些建置時才跑的工具（brace-expansion、minimatch、js-yaml、ws），不會進到線上網站。

---

## 四、上游蒸餾第一批（SEO、RSS、404）

完整蒸餾清單見 `docs/upstream-distill-2026-10.md`。這批做了清單裡前三件，線上原本都有症狀：

| 項目 | 線上現況 | 修好後（本機實測） |
|---|---|---|
| SEO 結構化資料 | 文章被標成 `schema.org/Movie`、`og:type=Post`、`article:section=A`、沒有發布日期、`twitter:site=@NotionNext` | `og:type=article`；`article:published_time`、`modified_time` 與 JSON-LD 的 `datePublished`／`dateModified` 都有 ISO 時間；分類是完整名稱「AI 技術白話文」；沒設 Twitter 帳號就不輸出 |
| RSS | `/rss/feed.xml` 回 200 的 HTML 空殼、0 篇文章 | 靜態檔在就用靜態檔；不在就由 `/api/rss` 即時產生（記憶體快取 10 分鐘），`feed.xml`／`atom.xml`／`feed.json` 都是 6 篇含全文 |
| 真正的 404 | 不存在的網址回 200 | 回 404，畫面是 Hexo 的「未找到該頁面」 |
| Notion 失敗保護 | Notion 一時連不上，ISR 會把空站寫進快取 | 執行期抓不到 Notion 時保留上一版頁面（首頁與文章頁），建置期不受影響。實測：用假的 Notion ID 啟動，log 出現攔截訊息，首頁和文章頁連續兩輪都回 200 且是原本的真實內容；從未建置過的網址回 500、`/api/rss` 回 503。分類、標籤、歸檔、分頁、搜尋頁還沒套用 |

順手修到：每一頁都預先載入 `/fonts/inter-var.woff2`，這個檔從 2025-06 起就不存在，線上每次都回一份 640 KB 的 HTML。已移除這行。

---

## 五、獨立審查（2026-10-24）

兩個沒看過開發過程的子代理分別審查正確性與資安，每條發現都先在程式或線上查證，屬實才修。

### 已修（附實測）

| 嚴重度 | 問題 | 修法與證據 |
|---|---|---|
| 高 | `/api/image` 轉手 Notion 圖片時丟掉 Notion 原本的安全限制，攻擊者可讓夾帶程式的 SVG 從 gyozalab.com 網域送出（反射型 XSS） | 補上 `Content-Security-Policy: ... sandbox` 與 `nosniff`；轉址改成逐跳檢查白名單、只收 https；加 10 秒逾時與 15 MB 上限。本機實測攻擊網址回應已帶 `sandbox`，文章內真實圖片照常 200 |
| 中 | `pages/auth/index.js` 把 OAuth 密鑰和存取權杖印進 log、塞進頁面資料 | 拿掉所有 log，頁面只回成功或失敗訊息 |
| 中 | 知道草稿的 Notion ID 就能用網址讀到草稿 | 兜底只放行嵌在文章裡的子頁面，資料庫列一律走已過濾的文章清單；清單比對改成不分破折號。實測用 32 碼 ID 開已發布文章仍是 200；擋草稿這半邊手上沒有草稿 ID，未實測，待驗收 |
| 中 | Notion 斷線時分類、標籤、歸檔、分頁、搜尋頁會把假文章「oops」和 Notion ID 存進快取，sitemap 也會收進 `/oops` | 這些頁面套用同一個保護；sitemap、llms.txt 斷線時回 500。實測斷線兩輪，四種列表頁都觸發保護、維持舊內容 |
| 中 | 工作區檢查本身失敗時，正常子頁面會被存成 404 | 改當作「Notion 暫時不可用」，保留舊頁 |
| 中 | `glob`、`picomatch` 被強制跨大版號，`test:ci`（覆蓋率模式）直接壞掉 | 移除這兩條強制版本（漏洞只在開發工具）。`test:ci` 已恢復，133 個測試全過 |
| 低 | 結構化資料（JSON-LD）沒跳脫 `<`，標題裡有 `</script>` 會破版 | 輸出前把 `<` 轉成 `<` |
| 低 | RSS 快取過期時 Notion 剛好失敗會回 503 | 改成先退回上一份 feed |

### 確認後不改

- 從沒產生過的網址在 Notion 斷線期間回 500：沒有舊頁可保留，500 不會被快取，Notion 恢復就正常。
- `/api/cache` 沒設權杖一律 503：刻意的設計。
- Mailchimp 訂閱沒有速率限制、`getNotionConfig` 用 `eval`、middleware 自抓 `redirect.json`：分別要啟用 Mailchimp、要有人改你的 Notion 設定表、要開 `UUID_REDIRECT` 才會觸發，目前都沒開。
- `processPostData` 修好後，若 Zeabur 有設 `AI_SUMMARY_API` 或 Algolia，文章頁會開始呼叫這兩個服務（AI 摘要有快取）。Zeabur 登入恢復後要確認這兩個變數。
- 圖片代理仍可被拿來轉任意外部圖片（經 Notion 的轉址），已加大小和逾時上限，靠 Cloudflare 快取擋流量。

---

## 驗證紀錄

- `jest`：127 個測試全過。`.claude/worktrees/` 底下的舊工作樹副本已加進 `jest.config.js` 的忽略清單，直接跑 `npm test` 就是全綠。
- `next build`（Next 15.5.28）：成功，`processPostData` 錯誤從 29 次歸零。
- 本機 `next start` 實測：
  - 首頁、文章頁正常顯示，主控台沒有錯誤。
  - 文章頁的上一篇、下一篇、6 篇推薦文章都有資料（線上版三欄皆空）。
  - 新安全標頭都有出現在回應裡。
  - `/_next/image?url=<外部圖片>` → 404（線上目前是 200）。
  - `/api/cache` 不帶權杖 → 503。
  - `/api/image?url=http://169.254.169.254/` → 400。
  - 外部公開 Notion 頁 ID → log 顯示攔截，畫面是 404 頁（主題的 404 頁回傳碼是 200，這是原本的行為）。
  - 本站資料庫根頁 ID → 沒被攔截、正常渲染，代表自己工作區的頁面不會被誤擋。
- GA4 瀏覽數查詢在本機回權限不足：舊版 v5 和新版 v7 測出一樣的結果，問題出在本機憑證的權限範圍，跟這次升級無關。
- 文章封面區空白：線上舊版也一樣，跟這次升級無關。
