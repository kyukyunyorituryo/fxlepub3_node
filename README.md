# Image Fixed-Layout EPUB Generator (JP)

画像フォルダから **日本語向け固定レイアウトEPUB（EPUB3）** を生成する Node.js モジュールです。  
主に **自炊スキャン画像・漫画・写真集** などを EPUB 化する用途を想定しています。

- 表紙画像（`cover.*`）対応
- EJS テンプレートによる EPUB 構造生成
- 目次（nav.xhtml / toc.ncx）生成
- 縦書き・右開き（日本語固定レイアウト）対応

---

## 特徴

- 📘 **EPUB3 固定レイアウト（Fixed Layout）**
- 🗂 **フォルダ内画像を自然順ソート**
- 🖼 **画像サイズ自動取得**
- 📑 **目次（目次＋ページ紐付け）生成**
- 📦 **JSZip による EPUB 直接生成**
- 🇯🇵 **日本語書籍（右開き・縦書き）対応設計**

---

## 動作環境

- Node.js **18 以上推奨**
- CommonJS（`require`）環境

---

## インストール

```bash
npm install ejs jszip uuid file-type image-size natural-orderby
```

---

## ディレクトリ構成例

```css
project/
├─ index.js           # このコード
├─ templete/
│  ├─ container.xml
│  ├─ fixed-layout-jp.css
│  ├─ page.ejs
│  ├─ opf.ejs
│  ├─ nav.ejs
│  ├─ tocncx.ejs
│  └─ cover.ejs
└─ images/
   ├─ cover.jpg
   ├─ 001.jpg
   ├─ 002.jpg
   └─ 003.jpg
```

※ `templete` ディレクトリ名はコード仕様通りです（`template` ではありません）。

---

## 使い方

### 基本例

```js
const { gen } = require('./index');

gen({
  title: 'サンプル書籍',
  author1: '著者名',
  author2: '',
  url: './images',
  output: './output.epub',

  // 表示方向・レイアウト設定
  panel_view: 'spread',
  page_direction: 'rtl',

  // 目次定義
  index: [
    ['cover.jpg', '表紙'],
    ['001.jpg', '第1話'],
    ['002.jpg', '第2話'],
    ['003.jpg', '第3話'],
  ],
});
```

---

## 入力データ仕様（`data`）

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `title` | string | 書籍タイトル |
| `author1` | string | 著者名 |
| `author2` | string | 著者名（任意） |
| `url` | string | 画像フォルダパス |
| `output` | string | 出力EPUBパス |
| `panel_view` | string | ページ表示方式（例: `spread`） |
| `page_direction` | string | ページ方向（`rtl` / `ltr`） |
| `index` | array | 目次定義配列 |

### `index` の形式

```js
[
  ['cover.jpg', '表紙'],
  ['001.jpg', '第1章'],
  ['002.jpg', '第2章'],
]
```

-   `index[0]` は必ず **表紙**
    
-   画像ファイル名と表示タイトルを対応させます
    

---

## 表紙画像について

-   ファイル名は **`cover.(jpg|png|webp...)`**
    
-   表紙画像が存在しない場合、エラーになります
    

```text
Error: cover 画像が見つかりません
```

---

## 生成されるEPUB構成

```css
EPUB/
├─ mimetype
├─ META-INF/
│  └─ container.xml
└─ item/
   ├─ standard.opf
   ├─ nav.xhtml
   ├─ toc.ncx
   ├─ style/
   │  └─ fixed-layout-jp.css
   ├─ image/
   │  ├─ cover.jpg
   │  ├─ i-001.jpg
   │  └─ i-002.jpg
   └─ xhtml/
      ├─ p-cover.xhtml
      ├─ p-001.xhtml
      └─ p-002.xhtml
```

---

## 注意点

-   **固定レイアウト専用**（リフロー型には非対応）
    
-   Kindle / Apple Books / Kobo 向けを想定
    
-   EPUB バリデーションは別途 `epubcheck` 推奨
    
-   テンプレートは用途に応じて自由にカスタマイズしてください
    

## 想定用途

-   自炊スキャンEPUB化
    
-   漫画・画集・写真集
    
-   PDF変換前段の画像EPUB生成
