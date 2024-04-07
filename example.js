var epub = require('./fxlepub3.js'); 

var data={
//"url":"C:\Users\Owner\Downloads\comic\testdata",
"url":"C:/Users/Owner/Downloads/comic/testdata/",
"output":'C:/Users/Owner/Downloads/comic/out.epub',
"title": "タイトル",
"author1": "著者名1",
"index": [
    ["1.jpg", "目次"],
    ["5.jpg", "最終ページ"]
    ],
"page_direction": "rtl",
"panel_view": "horizontal-rl",
}
epub.gen(data)