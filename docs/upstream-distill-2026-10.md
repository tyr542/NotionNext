# 上游蒸餾清單（v4.9.4 → v4.11.1）

- 日期：2026-10-24
- 範圍：只看 `lib/`、`components/`、`pages/`、`next.config.js`、`middleware.ts` 與 `themes/hexo/`。其他主題一律排除。
- 比對基準：fork 分支 `security/2026-10-deps-hardening`（HEAD `8cf9614a`）對 `upstream/main`（`93a14f25`，v4.11.1 之後）。merge-base `2e808eba`，上游 830 個提交（610 個非 merge）。
- 方法：讀 v4.9.4.4 到 v4.11.1 的發布說明，再用 `git log 2e808eba..upstream/main -- <路徑>` 逐個看 diff，並對照 fork 現況與線上 `gyozalab.com` 的實際回應。
- 確認過的站台設定：主題 hexo、`NOTION_CONFIG` 為空（沒用 Notion Config 表）、`HEXO_HOME_BANNER_ENABLE: false`、`HEXO_WIDGET_TO_COMMENT: false`、沒有啟用任何評論外掛、`API_BASE_URL` 明確設為 `https://www.notion.so/api/v3`。
- 沒改任何檔案，只讀。

> 注意：線上現在跑的是舊建置（Next 14.2.30，見 `SECURITY-UPDATE-2026-10-24.md`），下面「線上實測」的現象在 fork 程式碼裡都對得上同一段邏輯，不是舊版獨有。

---

## 一、結論（先看這裡）

先做這 3 件，都是「線上現在就有症狀」，而且改動小到中：

1. **SEO 結構化資料壞掉**：文章頁 `datePublished`／`dateModified` 是空的、`article:section` 變成單一字元 "A"、`og:type` 是 "Post"、文章被標成 `schema.org/Movie`。上游 `0f064a4c`、`e237634d` 修了。難度小。
2. **RSS 網址回 HTML**：`/rss/feed.xml` 實測回 200 但內容是網站的「loading」空殼頁（canonical 為 `https://gyozalab.com/undefined`），而 `sitemap.xml` 還把它列進去。上游 `2e3ef885` 加 `/api/rss` 後援。難度小。
3. **任何不存在的網址都回 HTTP 200**（軟 404）：實測 `/this-does-not-exist-xyz`、`/a/b/c` 都是 200、約 640 KB。上游路由用 `notFound: !props.post`，再配合「Notion 暫時抓不到時保留舊頁面，不要把空站寫進 ISR 快取」。難度中。

之後再說：站內連結轉換修正（小）、`getAllPageIds` 預防（小）、Error Boundary（小）。

**不用做**：文章密碼伺服器端驗證（線上目前沒有任何加密文章，且是 47 檔的大改）、`/api/revalidate`（綁整個新快取子系統，且你已有 60 秒 ISR）、首頁瘦身（fork 已有等效實作，首頁 `__NEXT_DATA__` 只有 50 KB）、`file.notion.com`（目前行得通，見下）。

---

## 二、建議蒸餾

優先序：P1 先做、P2 順手、P3 有空再做。下面第二張表是「條件式／暫緩」，不在這一輪範圍。

| 優先 | 項目 | 上游 commit／PR | fork 現況（含對照檔案） | 難度 | 好處 | 建議 |
|---|---|---|---|---|---|---|
| P1 | **SEO：結構化資料與 meta 修正** | `0f064a4c`（#4248）、`e237634d`（#4276） | `components/SEO.js` 有 `<link rel='canonical'>`（第 112 行），但 `getSEOMeta` 的 default 分支（第 411–422 行附近，`category: post?.category?.[0]` 在第 420 行）沒傳 `publishDay`／`lastEditedDay`，且 `category: post?.category?.[0]`。`category` 是字串，`[0]` 取到首字元。`og:type` 直接用 `meta.type`＝"Post"。`twitter:site`／`creator` 預設 `@NotionNext`。`themes/hexo/index.js` 第 301–302 行還留著 `itemScope itemType='https://schema.org/Movie'`。**線上實測**：文章頁 `article:published_time` 與 `modified_time` 空白、JSON-LD `BlogPosting` 沒有 `datePublished`／`dateModified`、`article:section="A"`、`og:type="Post"`、`twitter:site="@NotionNext"`、HTML 有 `itemType="https://schema.org/Movie"` | 小（`SEO.js` 一檔 ＋ hexo `index.js` 兩行；上游版另用 `lib/sitemap-utils.js` 的 `createSiteUrl`，fork 沒有該檔，可不搬，直接用字串組） | SEO。Google 文章結構化資料要 `datePublished`；Movie 微資料與 BlogPosting JSON-LD 互相打架；Facebook／X 預覽 meta 變正確 | **做**。照上游 `getSEOMeta` 的 `publishTime`／`modifiedTime`（`getIsoTime(post.publishDate)`）、`category` 判斷 `Array.isArray`、`og:type` 把 `Post` 轉 `article`、`twitter:*` 空值不輸出。fork 自己加的 FAQ Schema（`extractFAQSchema`）要保留 |
| P1 | **RSS 後援 `/api/rss`** | `2e3ef885`（`pages/api/rss.js` ＋ `next.config.js` rewrites）；旁支 `fd8ef41e`、`1c60cc5e` | `lib/utils/rss.js` 在首頁 `getStaticProps` 呼叫 `generateRss`，把檔案寫進 `public/rss/`（該目錄在 `.gitignore`）。線上拿不到這些檔案，原因待查：可能是 Next 伺服器模式不服務啟動後才寫入 `public/` 的檔案，也可能與 Zeabur 建置／執行分離或 `.zeabur/` 設定有關。`next.config.js` 只有 `/feed` 轉址到 `/rss/feed.xml`，沒有後援。**線上實測**：`/rss/feed.xml`、`atom.xml`、`feed.json` 全部回 200 但內容是 HTML 空殼 | 小（新增一個 API 檔 ＋ rewrites 三條） | RSS 訂閱與 Google／AI 爬蟲不再拿到空殼。上游版只輸出摘要，你的 fork 目前輸出全文 | **做**。建議不要整檔照抄上游（只有摘要、20 篇）；改成在 `/api/rss` 內直接呼叫 fork 現有的 `generateRssInternal` 邏輯，結果放記憶體快取 10 分鐘。順手把 `sitemap.xml.js` 裡的 `/rss/feed.xml` 保留，因為修好後它就是有效網址。可選：`ac6378f4`（#4467）`RSS_FULL_CONTENT=false`，現在每個 feed 約 640 KB |
| P1 | **真 404 ＋ Notion 失敗時保留舊頁面** | `a85fd8ab`（`notFound: !props.post`，含在「构建模式优化」大提交，只取 3 個 `getStaticProps` 的那一行）、`a9d0a58b` ＋ `95dd703c`（#4575 內的 ISR 失敗處理：`requireAvailableData`、`revalidateReason`）、`ed0f423a` | `pages/[prefix]/index.js`、`pages/[prefix]/[slug]/index.js`、`pages/[prefix]/[slug]/[...suffix].js` 的 `getStaticProps` 沒有 `notFound`；`fetchGlobalAllData`（`lib/db/SiteDataApi.js` 第 60–100 行）遇到任何例外就吞掉並回 `EmptyData`（內含 slug 為 `oops` 的假文章）。意味著：Notion 暫時 403／429／逾時時，ISR 會把「空站」或「找不到」寫進快取 60 秒。**線上實測**：不存在的網址回 200、約 640 KB | 中（`SiteDataApi.js` 加一個「資料不可用」旗標＋三個頁面傳 `revalidateReason`；首頁、`/404` 另外處理） | SEO（軟 404 會被 Google 判為低品質、浪費抓取額度）＋穩定性（Notion 偶發失敗時保留上一版好頁面，而不是用空站覆蓋）。你之前的 Notion 403 事件就是這類情境 | **做**，但兩件綁在一起做：只加 `notFound` 而不加失敗保護，Notion 一抖動就會把真實文章快取成 404。實作：`fetchGlobalAllData` 失敗時標記 `__notionDataUnavailable`；在執行期（`revalidateReason !== 'build'`）遇到旗標就 `throw`，Next 會繼續提供舊頁面；建置期維持原行為。`revalidateReason` 在 Next 15.5 的 `getStaticProps` context 可用 |
| P2 | **站內連結轉換（`?pvs=4`、Page 類型頁面）** | `ca235c4c`（#4434）、`c2cb4278`（#4160） | `lib/db/notion/convertInnerUrl.js` 用 `getLastPartOfUrl(anchorTag.href)` 取最後一段，再用 `checkStrIsNotionId`（`/^[a-zA-Z0-9]{32}$/`）判斷。Notion 複製出來的連結常帶 `?pvs=4`，一帶就不合格，連結不會轉成站內網址。`components/ExternalPlugins.js` 第 178 行傳的是 `allNavPages`（只有已發布的 Post，`SiteDataApi.js` 的 `getNavPages`），連到「頁面」類型（例如 About）也不會轉 | 小（`convertInnerUrl.js` 約 10 行；`allLinkPages` 需在 `SiteDataApi.js` 加 `getLinkPages` 並把欄位透過 props 傳出，約 25 行） | 文章內「連到自己其他文章」的連結從外站 notion.so 變成站內連結，避免 404 或跳去 Notion | 做。先確認你的文章是否真的有貼 Notion 內部連結；有才做 `allLinkPages`，只修 `?pvs=4` 的話只改 `convertInnerUrl.js` 一個檔 |
| P2 | **`getAllPageIds` 認得 `reducerResults`** | `9eaa9275` | `lib/db/notion/getAllPageIds.js` 的 `getQueryIds` 只讀 `collection_group_results`、`results`、`blockIds`。Notion 若把結果換成 `reducerResults.collection_group_results`，文章清單會掉回 `page_sort` 備援，順序與內容可能不對 | 小（3 行） | 預防 Notion 回應格式再變動時文章列表消失或亂序 | 順手做。fork 目前線上正常，所以只是保險 |
| P3 | **Error Boundary** | `27d962b8` | `lib/utils/errorHandler.js` 已有 `createErrorBoundary`（第 126 行），但 `pages/_app.js` 沒有包 | 小（`_app.js` 一處） | 某個元件丟例外時，不會整頁白屏而是顯示重新整理按鈕 | 可做。上游文字是英文，改成繁中；其餘照抄 |
| P3 | **`loadExternalResource` 競態** | `50e77e06`（#4527，只取 `lib/utils/index.js` 部分） | `lib/utils/index.js` 的 `loadExternalResource`：第二個呼叫者看到已存在的 `<script>` 就立刻 resolve，即使它還沒載完，之後 `window.X` 可能還是 `undefined`。`SEO.js` 的 WebFont 載入與其他外掛都用它 | 小（約 30 行 ＋ 一個測試） | 懶載入外掛偶發「第二次進頁面功能沒出現」的穩定性問題；你的 Hexo 首頁橫幅關閉，所以 Hero 那半個修正用不到 | 有空再做 |

### 條件式／暫緩（現在不做，有需求或升級時才做）

| 優先 | 項目 | 上游 commit／PR | fork 現況（含對照檔案） | 難度 | 好處 | 建議 |
|---|---|---|---|---|---|---|
| P3 | **`file.notion.so／.com` 簽名直連轉 `attachment:`** | `d31a029e`（#4499）；發布說明列 #4476、#4473 | `lib/db/notion/mapImage.js` 沒有 `convertFileCdnUrl`。目前行得通：線上 HTML 的圖片全是 `www.notion.so/image/attachment%3A…`，`/api/image` 白名單也只放 `www.notion.so`、`notion.so`、`img.notionusercontent.com`。Notion 現在已在 `signed_urls` 回 `file.notion.so`，但 fork 的圖片不靠它 | 小（`convertFileCdnUrl.js` 17 行 ＋ `mapImage.js` 9 行） | 預防：只有「封面或圖示」以簽名直連形式出現在 block 裡時才會壞（簽名約一小時過期）。升級 `notion-client` 到 7.12 時最可能觸發 | 先不做；之後升 `notion-client`／`react-notion-x`（目前 7.10.0）時一起做。同時把 `file.notion.com` 加進 `next.config.js` 的 `remotePatterns`（目前只有 `file.notion.so`）與 `lib/utils/imageProxy.js` 白名單 |
| P3 | **Heading 4 與新標題型別** | `487ec9e4`（#4241）、`fdac7574`、`a17a52f8` | `lib/db/notion/getPageTableOfContents.js` 的 `indentLevels` 只有 `header`、`sub_header`、`sub_sub_header`；`lib/utils/notion.util.js` 沒有 `normalizeNotionBlockType`。線上文章目前仍回 `sub_header` 等舊名，TOC 與標題正常 | 小 | 只有你在 Notion 用了 Heading 4 才會漏出目錄與樣式 | 暫不做；遇到時再做 |
| P3 | **文章密碼改伺服器端驗證** | 合併 `95dd703c`（PR #4575），主體 `63c21c2f`、`a2845930`、`a9d0a58b`，新增 `pages/api/post/unlock.js`、`lib/server/postAccess.js`、`lib/server/requestSecurity.js`、`hooks/useProtectedPost.js`、`lib/utils/publicPost.js`，並動到 `lib/db/SiteDataApi.js`、`getNotionPost.js`、各 `pages/` 路由與 25 個主題的 ArticleLock | fork 用 `lib/utils/articlePassword.js`（PBKDF2，`9bc66bb2` 加固）在**瀏覽器**驗證（`pages/[prefix]/index.js` 的 `validPassword`），所以加密文章的完整 `blockMap` 與密碼雜湊都在頁面資料裡。`themes/hexo/components/ArticleLock.js` 沿用 `validPassword` 介面。**線上實測**：首頁與 `/page/2`、`/page/3` 的列表資料共 28 篇已發布文章，`password` 欄位全是空字串，目前沒有加密文章（Invisible 頁面線上為空） | 大（上游 69 個檔案、1936 行新增，且綁在上游新的 `resolvePostProps`／`ensureBlockMap`）。自行縮小版：中（約 150 行：加密文章不送 `blockMap`、新增 `/api/post/unlock` 驗證後回傳內容、`ArticleLock` 改打 API） | 加密文章內容不再能從頁面原始碼讀出 | **目前不做**，等你真的要用加密文章再做縮小版，不要整包搬。若搬：Zeabur 要設 `TRUST_PROXY=true`，否則上游的嘗試次數限制（`requestSecurity.js`）會用代理的 IP |
| P3 | **`/api/revalidate`（有界重建）** | `77b2fcb0`（#1020）、`f751323f`、`dfe872b7`；`lib/server/revalidation.js` | fork 只有 `pages/api/cache.js`（只清 `data.json` 檔案快取），沒有按需重建；靠 `NEXT_REVALIDATE_SECOND = 60` 的 ISR | 上游版：大（依賴上游重寫的 `lib/cache/*`：`invalidation.js`、`build_session.js`、`namespace.js`，以及 `collectRevalidationPaths` 讀 `.next/prerender-manifest.json`）。自寫版：小（約 30 行 `res.revalidate(path)`） | 想在 Notion 改完後**立刻**更新時才有價值。你已經是 60 秒 ISR，感受不明顯 | 不搬上游版。真要「發文後立即更新」，自寫 `pages/api/revalidate.js`：沿用 `/api/cache` 的 Bearer 權杖、`timingSafeEqual`，只接受單一路徑 |
| P3 | **內嵌資料庫視圖的篩選與排序** | `c023e79a`（#4240）、`8214445d`、`08481aa1`（#4290）、`09fb0c48`、`5a1017a7`、`7153cdce`、`6b24adc9`、`2c0559ff`、`4fb658be`（新增 `lib/db/notion/filterCollectionViewData.js`） | fork 沒有這個檔案。`getAllPageIds.js` 只讀 Notion 回傳的順序／`page_sort` | 大（約 300 行新檔，且改 `getAllPageIds` 與 `getPostBlocks`） | 只在你的文章內嵌了「有篩選或排序的 Notion 資料庫視圖」才有影響；首頁文章順序你已用 `lib/utils/postSort.js` 自己控制 | 不做，除非文章裡有嵌入資料庫視圖而顯示不對 |

---

## 三、fork 已有／不需要

| 項目 | 上游 commit／PR | 為什麼不用 | fork 對照 |
|---|---|---|---|
| Next.js 15、`/api/cache` 強制權杖、OAuth token 不進網址、非本站工作區 404、安全標頭、關閉 `/_next/image`、resolutions | 發布說明 v4.11.0 | 這個分支已做（不重列） | `next.config.js`、`pages/api/cache.js`、`SECURITY-UPDATE-2026-10-24.md` |
| 首頁／列表 page-data 瘦身 | `dbd2cecf`（v4.10.0）、`cb624a56` | fork 自己做過等效甚至更嚴的版本：首頁移除 `blockMap`、`content`、`toc`，並有預算檢查腳本。線上首頁 `__NEXT_DATA__` 只有約 50 KB（`allNavPages` 33 KB、`posts` 21 KB）。上游改用欄位白名單，節省有限 | `lib/utils/listPageProps.js`、`scripts/page-data-budget.js`、`pages/index.js`（`ec4db6bf`、`02933f23`） |
| Notion 系統屬性（Created／Last edited time）遺失 | `f51da60e` | 這是上游自己的「瘦身」把兩個欄位刪掉、後來又還原。fork 從來沒做那段刪除 | `lib/db/notion/recordMapForProps.js` 第 14–15 行保留兩個欄位；`getPageProperties.js` 第 101–106 行使用 |
| 首頁 page-data 之外的 `cleanPostSummary` 白名單 | `dbd2cecf` | 同上 | 同上 |
| `allLinkPages` 之外的內鏈 404 | — | 已併入上面 P2 | — |
| 圖片反代與簽名刷新整套（`NEXT_PUBLIC_NOTION_HOST` 還原、`refreshSignedUrls`、外鏈圖經中轉） | `d31a029e`、`1565d080`、`fdfd340d`、`68f3d953` | fork 的圖片全部走 `attachment:` → `www.notion.so/image/...` ＋ `/api/image`；非圖片檔的簽名在 ISR 重新產生時就換新。上游那套是為「改用 notion-client 7.12 後 `file.notion.com` 直連」準備的 | `lib/utils/imageProxy.js`、`pages/api/image.js`、`components/LazyImage.js`、`lib/db/notion/mapImage.js` |
| Notion 請求加瀏覽器 User-Agent | `b246a9c6` | fork 已做 | `lib/db/notion/getNotionAPI.js`、`pages/api/image.js`（`1fde605f`、`7741ef20`） |
| 以 SHA256 摘要比對文章密碼 | `3b1437a0` | fork 已有更強的 PBKDF2 版 | `lib/utils/articlePassword.js` |
| `GlobalContext` memoize、throttle、sharp | `6ac514af` 等 | fork 已自行做過同名改動 | `3ed86f07`、`843b0886`、`a24a6d6d` |
| Font Awesome 自架與延後載入 | `df71ae22`、`a9525fff` 等 | fork 已自架 | `conf/font.config.js`（`/css/all.min.css`）、`public/webfonts/` |
| 快取路徑雜湊（`ENAMETOOLONG`） | `9c4902a2` | fork 的 `lib/cache/local_file_cache.js` 是單一 `data.json`，沒有用 key 當檔名 | — |
| 建置快取、預抓並行、`staticPaths` 共享 | `94219881`、`5700f367`、`ee409680`、`dbd2cecf` 系列 | 只影響建置速度，不影響執行期；你是伺服器模式 ISR | — |
| Notion Config 表相關修正 | `7a94ccdb`、`1699e627`、`5b1ce0c2`（#4386） | 線上 `NOTION_CONFIG` 為空，沒用 Config 表 | — |
| Hexo Hero 打字指令碼 | `50e77e06`（Hero 部分）、`512524a7` | `HEXO_HOME_BANNER_ENABLE: false`，Hero 不渲染 | `themes/hexo/config.js` |
| AOS 重新整理 | `72690b61`、`ab52f6b2`、`6e903aea` | 先加後移除，淨變動為零 | — |
| 跳到留言按鈕、留言外掛判斷 | `6b8a4ce9`、`396fbe83` | `HEXO_WIDGET_TO_COMMENT: false`，且沒有任何評論外掛 | — |
| 標籤計數把 Invisible 文章算進去 | `b4811a25` | 線上 `invisiblePages` 為空 | `lib/db/notion/getAllTags.js` |
| Hexo 首頁卡片、第一頁樣式、箭頭圖示、文章切換骨架 | `1a1e03ff`、`f738bf2c`、`0938026a`、`b04dff9b` | fork 已大幅重做 Hexo 版面（`8a18c724`、`2ac3457a`、`2c21e8a4` 等），直接搬會衝突 | `themes/hexo/` |
| 預設不載 Noto 中文網路字型 | `12b23ed3`（#4487） | 你刻意使用 Noto Serif TC，見下方「額外觀察」 | `pages/_document.js` |
| 不蒜子改 Vercount | `6a78a830`、`0fcd6233`、`cb7e33e4` | 你用 GA4 注入 | `lib/plugins/ga-pageviews.js`（`5cf7a622`） |
| 評論（NotionComments）、PWA、Content MCP、OpenAI 代理、原創證明、主題調色盤、`INNER_PAGE_URL_PARENT_PATH` | 多個 | 新功能，非修正，且 AI 代理與 MCP 會增加攻擊面 | — |
| 其他主題（heo、Fuwari、Proxio、opc、XuHome、Endspace、Matery、Magzine 等）的修正 | — | 排除 | — |
| Giscus、Mailchimp、Algolia、Clerk、Notion OAuth 相關 | `1a6b2263`、`5c04ba89`、`87ac4513` | 你沒啟用 | — |

---

## 四、額外觀察（不是上游蒸餾，但這次實測順便發現）

| 現象 | 證據 | 建議 |
|---|---|---|
| 每個頁面的 HTML 內嵌約 225 KB 的 Google 字型 CSS（Noto Serif TC 的全部 `unicode-range` 分段），文章頁 HTML 共約 690 KB | 線上文章頁抓回的 `<style data-href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC…">` 區塊 224,586 位元組 | 這是 Next 的字型內嵌最佳化把 `pages/_document.js` 的 Google Fonts 連結展開。若在意載入量，改成自架 Noto Serif TC 子集（只要標題用到的 600／700 兩個字重），或關掉內嵌。這是你自己的設計取捨，不是上游問題 |
| `next.config.js` 的 `preBuild` 判斷寫成 `!process.env.npm_lifecycle_event === 'export'`，永遠為 false，所以每次載入設定都會執行刪除 sitemap／llms.txt | 上游 `a85fd8ab` 改成 `!==` | 影響很小。要順手修時改成 `!==`，但同時評估是否仍想在 `dev`／`start` 時刪檔 |

---

## 五、建議的實作順序與驗收方式

順序有理由：RSS 後援（第 2 項）要在真 404（第 3 項）之前上。實測 `/rss/feed.xml` 與不存在的網址回的是同一個空殼頁（639,562 對 639,546 位元組），都是請求落到 `[prefix]` 路由。先做真 404 而沒做 RSS 後援，RSS 會從「200 HTML」變成 404，而 `sitemap.xml` 仍列著它。

1. **SEO 修正**（P1）。驗收：本機 `next start` 後抓文章頁，檢查 `article:published_time` 有值、JSON-LD 有 `datePublished`、`article:section` 是完整分類名、`og:type=article`、HTML 不再含 `schema.org/Movie`。
2. **RSS 後援**（P1）。驗收：`curl -I /rss/feed.xml` 回 `application/rss+xml` 而非 `text/html`，內容含 `<item>`。
3. **真 404 ＋ 失敗保護**（P1）。驗收：`/this-does-not-exist-xyz` 回 404；用假的 `NOTION_PAGE_ID` 或斷網模擬 Notion 失敗，確認已產生的頁面在重新驗證時仍回舊內容（而不是「無法獲取Notion數據」假文章）。
4. P2 兩項（站內連結、`reducerResults`）可併成一個提交。

## 六、風險

- 第 3 項動到所有文章路由的資料流，是這份清單裡唯一有回歸風險的；先在分支上用 `npm run build` 加本機 `next start` 驗證，再合併。
- 本報告的「線上實測」都是在 2026-10-24 對 `gyozalab.com` 的唯讀請求（`curl`），線上是舊建置；合併分支部署後現象可能因 Next 15 而略有不同，修完仍要再實測一次。
- 上游實作大多假設上游自己重寫過的 `SiteDataApi.js`／`lib/cache`，**不要用 `git cherry-pick`**，一律「讀 diff、照意圖手寫」。
- 830 筆提交中有 220 筆是 merge，其餘大量是文件、dependabot 與其他主題，已略過。
