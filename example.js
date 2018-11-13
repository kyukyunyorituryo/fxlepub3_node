var epub = require('./fxlepub3.js'); 

var data={
//"url":"C:/Users/user/Downloads/comic/test/",
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
"panel_view": "horizontal-rl",
"cover_file": {},
"files": []
}
epub.gen(data)