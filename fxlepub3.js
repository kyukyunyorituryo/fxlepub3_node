const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const JSZip = require('jszip');
const { v4: uuidv4 } = require('uuid');
const { fileTypeFromBuffer } = require('file-type');
const { imageSize } = require('image-size');
const { compare } = require('natural-orderby');

/**
 * 0埋めID生成
 */
function padId(num, length = 3) {
  return String(num).padStart(length, '0');
}

/**
 * ISO日時（Z付き）
 */
function nowISOString() {
  return new Date().toISOString().slice(0, 19) + 'Z';
}

/**
 * テンプレート読み込み
 */
function loadTemplate(name) {
  return fs.readFileSync(path.join(__dirname, 'templete', name), 'utf-8');
}

exports.gen = async function gen(data) {
  const uuid4 = uuidv4();
  const date = nowISOString();
console.log(data)
  data.files = [];

  // ファイル一覧取得
  const fileNames = fs.readdirSync(data.url).sort(compare());
  console.log(fileNames);

  // 画像読み込み
  for (const [index, fileName] of fileNames.entries()) {
    const filePath = path.join(data.url, fileName);
    const buffer = fs.readFileSync(filePath);

    const type = await fileTypeFromBuffer(buffer);
    if (!type) {
      console.warn('判定不能:', fileName);
      continue;
    }

    let dimensions;
    try {
      dimensions = imageSize(buffer);
    } catch {
      console.warn('画像サイズ取得失敗:', fileName);
      continue;
    }

    const baseName = path.parse(fileName).name;

    if (baseName === 'cover') {
      data.cover_file = {
        id: 'cover',
        file_id: 'cover',
        file_name: fileName,
        data: buffer,
        type: type.mime,
        ext: type.ext,
      };
      data.width = dimensions.width;
      data.height = dimensions.height;
    } else {
      const id = padId(index + 1);
      data.files.push({
        id,
        file_id: `i-${id}`,
        file_name: fileName,
        data: buffer,
        type: type.mime,
        ext: type.ext,
      });
    }
  }

  if (!data.cover_file) {
    throw new Error('cover 画像が見つかりません');
  }

  // 目次突き合わせ
  const mokuji = [];
  for (let i = 1; i < data.index.length; i++) {
    const [fileName] = data.index[i];
    const file = data.files.find(f => f.file_name === fileName);
    if (file) {
      mokuji.push([file.file_id, file.id]);
    }
  }

  // テンプレート読み込み
  const templates = {
    containerXML: loadTemplate('container.xml'),
    css: loadTemplate('fixed-layout-jp.css'),
    page: loadTemplate('page.ejs'),
    opf: loadTemplate('opf.ejs'),
    nav: loadTemplate('nav.ejs'),
    toc: loadTemplate('tocncx.ejs'),
    cover: loadTemplate('cover.ejs'),
  };

  // EJS レンダリング
  const nav = ejs.render(templates.nav, {
    title: data.title,
    cover: data.index[0][1],
    data,
    mokuji,
  });

  const opf = ejs.render(templates.opf, {
    uuid4,
    title: data.title,
    creator1: data.author1,
    creator2: data.author2 || '',
    date,
    panel_view: data.panel_view,
    page_direction: data.page_direction,
    cover_ext: data.cover_file.ext,
    type: data.cover_file.type,
    data,
  });

  const tocncx = ejs.render(templates.toc, {
    uuid4,
    creator1: data.author1,
    title: data.title,
    cover: data.index[0][1],
    toc1: '目次',
    data,
    mokuji,
  });

  const coverXhtml = ejs.render(templates.cover, {
    title: data.title,
    width: data.width,
    height: data.height,
    covername: data.cover_file.file_name,
  });

  const pages = data.files.map(file =>
    ejs.render(templates.page, {
      title: data.title,
      width: data.width,
      height: data.height,
      image: `${file.file_id}.${file.ext}`,
    })
  );

  // EPUB ZIP生成
  const zip = new JSZip();

  zip.file('mimetype', 'application/epub+zip');

  zip.folder('META-INF')
    .file('container.xml', templates.containerXML);

  const item = zip.folder('item');
  item.file('standard.opf', opf);
  item.file('nav.xhtml', nav);
  item.file('toc.ncx', tocncx);

  // 画像
  const img = item.folder('image');
  img.file(`cover.${data.cover_file.ext}`, data.cover_file.data);
  for (const file of data.files) {
    img.file(`${file.file_id}.${file.ext}`, file.data);
  }

  // CSS
  item.folder('style')
    .file('fixed-layout-jp.css', templates.css);

  // XHTML
  const xhtml = item.folder('xhtml');
  xhtml.file('p-cover.xhtml', coverXhtml);
  pages.forEach((page, i) => {
    xhtml.file(`p-${padId(i + 1)}.xhtml`, page);
  });

  // 出力
  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream(data.output))
    .on('finish', () => {
      console.log(`${data.output} に出力されました。`);
    });
};
