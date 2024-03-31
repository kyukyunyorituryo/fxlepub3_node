# fxlepub3
generate EPUB from images in Node.js.
------

## Usage

npmの公開停止


## Demo Code:
```javascript
var epub = require('fxlepub3'); 

var data={
"url":"C:/Users/user/Downloads/comic/testdata/",
"output":'C:/Users/user/Downloads/comic/fxlsample/out.epub',
"title": "タイトル",
"author1": "著者名1",
"author2": "著者名２",
"index": [
    ["cover.jpg", "表紙"],
    ["00001.jpg", "目次"],
    ["00005.jpg", "最終ページ"]
    ],
"page_direction": "rtl",
"panel_view": "horizontal-rl"
}

epub.gen(data)
```