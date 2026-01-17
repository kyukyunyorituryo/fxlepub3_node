const { v4: uuidv4 } = require('uuid');
var uuid4 = uuidv4();
var today = new Date();
var date = today.toISOString().slice(0,19)+"Z";
fs = require('fs');
ejs = require('ejs');
var JSZip = require("jszip");
const { fileTypeFromBuffer } = require('file-type');
const { imageSize } = require('image-size');
//console.log(uuid4)
// Using CommonJS modules
const { compare } = require('natural-orderby');
//var pdf2image = require('./pdf2image.js'); 
exports.gen = async function (data) {
data.files=[]
//console.log(data)

//フォルダー内の読み込み
var file_names = fs.readdirSync(data.url).sort(compare());;
console.log(file_names);
if(file_names.filter(val => { return val.split('.')[0] === 'cover'})){

}else{

}
for (var i in file_names) {
//console.log(file_names[i]);
f_data=fs.readFileSync(data.url + file_names[i])
const type = await fileTypeFromBuffer(f_data);
if (!type) {
  console.warn('判定不能:', file_names[i]);
  continue;
}
let dimensions;
try {
 dimensions = imageSize(f_data);
} catch (e) {
  console.warn('画像サイズ取得失敗:', file_names[i]);
  continue;
}
//console.log(dimensions.width, dimensions.height);
//console.log(type)
if(file_names[i].split('.')[0] == 'cover'){
data.cover_file= {
"id" :'cover',
"file_id": file_names[i].split('.')[0],
"file_name": file_names[i],
"data": f_data,
"type": type.mime,
"ext":type.ext
}
data.width=dimensions.width
data.height=dimensions.height
}else{
data.files.push(
{
"id" :('0000' + (parseInt(i) +1)) .slice( -3 ),
"file_id": "i-"+ ('0000' + (parseInt(i) +1)) .slice( -3 ),
"file_name": file_names[i],
"data": f_data,
"type": type.mime,
"ext":type.ext
});}}

console.log(data)
//目次データの突き合わせ
mokuji=[]
for (let i=1; i < data.index.length ; i++) {
var getfilename = data.files.filter(function(obj) {
      return obj.file_name === data.index[i][0];
    });
mokuji.push([getfilename[0].file_id,getfilename[0].id])
}
//console.log(mokuji)

//テンプレートファイルの読み込み
var containerXML = fs.readFileSync(__dirname + '/templete/container.xml', 'utf-8');
var css_style = fs.readFileSync(__dirname + '/templete/fixed-layout-jp.css', 'utf-8');
var pagetemplete = fs.readFileSync(__dirname + '/templete/page.ejs', 'utf-8');
var opftemplete = fs.readFileSync(__dirname + '/templete/opf.ejs', 'utf-8');
var navtemplete = fs.readFileSync(__dirname + '/templete/nav.ejs', 'utf-8');
var toctemplete = fs.readFileSync(__dirname + '/templete/tocncx.ejs', 'utf-8');
var covertemplete = fs.readFileSync(__dirname + '/templete/cover.ejs', 'utf-8');

//ejsテンプレートエンジン　ページファイル
var nav = ejs.render(navtemplete, {
    title: data.title,
    cover:data.index[0][1],
    data: data,
    mokuji:mokuji
})
//console.log(nav)
if(data.author2==null)data.author2=''
var opf = ejs.render(opftemplete, {
    uuid4:uuid4,
    title: data.title,
    creator1: data.author1 ,
    creator2: data.author2 ,
    date:date,
    panel_view:data.panel_view,
    page_direction:data.page_direction,
    cover_ext:data.cover_file.ext,
    type:data.cover_file.type,
    data:data
})
//console.log(opf)
var tocncx = ejs.render(toctemplete, {
    uuid4:uuid4,
    creator1: data.author1 ,
    title: data.title,
    cover:data.index[0][1],
    toc1:"目次",
    data: data,
    mokuji:mokuji
})
//console.log(tocncx)
var coverxhtml = ejs.render(covertemplete, {
    title: data.title,
    width: data.width,
    height: data.height,
    covername: data.cover_file.file_name
})

var pages = [];
for(let i in data.files) {
pages[i] = ejs.render(pagetemplete, {
    title: data.title,
    width: data.width,
    height: data.height,
    image:data.files[i].file_id +"."+data.files[i].ext,
})};
//console.log(pages[0])

//ZIP圧縮
var JSZip = require("jszip");
var zip = new JSZip();
zip.file("mimetype", "application/epub+zip");
var meta = zip.folder("META-INF");
meta.file("container.xml", containerXML);
var item = zip.folder("item");
item.file("standard.opf", opf);
item.file("nav.xhtml", nav);
item.file("toc.ncx", tocncx);
//画像ファイル生成
var img = zip.folder("item/image");
img.file("cover." + data.cover_file.ext,data.cover_file.data)
for (let i in data.files) {
img.file(data.files[i].file_id+"."+data.files[i].ext,data.files[i].data)
}
var style = zip.folder("item/style");
style.file("fixed-layout-jp.css",css_style)
var xhtml = zip.folder("item/xhtml");
xhtml.file("p-cover.xhtml",coverxhtml);
for (let i in data.files) {
xhtml.file("p-"+ ('0000' + (parseInt(i)+1) ).slice( -3 )+".xhtml", pages[i]);
}

// zip.file("file", content);
// ... and other manipulations

zip
.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
.pipe(fs.createWriteStream(data.output))
.on('finish', function () {
    // JSZip generates a readable stream with a "end" event,
    // but is piped here in a writable stream which emits a "finish" event.
    console.log(data.output+"に出力されました。");
});
}