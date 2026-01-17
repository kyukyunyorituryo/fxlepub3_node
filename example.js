var epub = require('./fxlepub3.js'); 

var data={
//"url":"C:\Users\Owner\Downloads\comic\testdata",
"url":"D:/Download/comic/testdata/",
//D:\Download\comic\testdata
"output":'C:/Users/Owner/Downloads/out.epub',
"title": "タイトル",
"author1": "著者名1",
"index": [
    ["001.jpg", "目次"],
    ["12.jpg", "最終ページ"]
    ],
"page_direction": "ltr",
"panel_view": "vertical-lr",
}
epub.gen(data)