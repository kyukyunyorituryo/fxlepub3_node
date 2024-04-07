
import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';

const pdfPath = 'C:/Users/Owner/Documents/自炊/第三種電気主任技術者試験受験案内.pdf';
const outDir = 'C:/Users/Owner/Downloads/pdfimage';

// PDFファイルの読み込み
const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
const pdfDoc = await pdfjs.getDocument({ data: pdfData }).promise;

for (let i = 1; i <= pdfDoc.numPages; i++) {
	const page = await pdfDoc.getPage(i);
	const viewport = page.getViewport({ scale: 1.0 });
	//1619,2333
//	const canvas = createCanvas(1619,2333);
	const canvas = createCanvas(viewport.width, viewport.height);
	const ctx = canvas.getContext('2d');

	// TODO ここでanyをつかわない方法をさがしたい
	await page.render({ canvasContext: ctx,viewport}).promise;

	// 書き出し
	const image = canvas.toBuffer();
	const writeableData = new Uint8Array(image);
	await fs.promises.writeFile(`${path.join(outDir, `out_${i}`)}.png`, writeableData);
}  