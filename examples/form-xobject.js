const PDFDocument = require('../');
const fs = require('fs');
const tiger = require('./tiger');

const doc = new PDFDocument({
  size: 'A4'
});
doc.pipe(fs.createWriteStream('form-xobject.pdf'));

//Create Form XObject named tigerLogo.
doc.addFormXObject('tigerLogo', function (doc) {
  doc.save();
  doc.translate(-20, -32.5).scale(0.3);
  for (let i = 0, len = tiger.length; i < len; i++) {
    let part = tiger[i];
    doc.save();
    doc.path(part.path); // render an SVG path
    if (part['stroke-width']) {
      doc.lineWidth(part['stroke-width']);
    }
    if (part.fill !== 'none' && part.stroke !== 'none') {
      doc.fillAndStroke(part.fill, part.stroke);
    } else {
      if (part.fill !== 'none') {
        doc.fill(part.fill);
      }
      if (part.stroke !== 'none') {
        doc.stroke(part.stroke);
      }
    }
    doc.restore();
  }
  doc.restore();
}, {
  bbox: [-80, -80, 80, 80]
});

//Page 1
doc.fontSize(16).text('Using Form XObject on repetitive objects reduces file size.');
for (let i = 0; i < 12; ++i) {
  doc.save();
  doc.translate(doc.page.width / 2, doc.page.height / 2)
    .rotate(i * 30)
    .translate(0, -200)
    .scale(0.5)
    .formXObject('tigerLogo'); //apply the Form Object
  doc.restore();
}

//Create Form XObject named notebookPage
let xf = doc.page.width - 40;
doc.addFormXObject('notebookPage', function (doc) {
  //Form XObject may pack everything, texts, paths, images and other Form XObjects.

  //tiger logo
  doc.save().translate(80, 80).scale(0.5).formXObject('tigerLogo').restore();

  //lines
  doc.save().lineWidth(0.5);
  for (let i = 0; i < 16; ++i) {
    let y = 120 + 36 * (i + 1.5);
    doc.moveTo(40, y).lineTo(xf, y).stroke();
  }
  doc.moveTo(xf - 120, 120).lineTo(xf, 120).stroke();
  doc.restore();

  //text:Date
  doc.fontSize(14).text('Date', xf - 120, 120 - 21);
});

//notebook pages
const pageText = [
  'First page',
  'Second page.',
  'Third page.',
];
pageText.forEach(text => {
  doc.addPage();
  doc.formXObject('notebookPage');
  doc.fontSize(24).fill('#0000ff').text(text, 40, 150, {
    width: xf - 40,
    lineGap: 36 - 24
  });
});

//the page has two notebookPage.
const scale = doc.page.height / 2 / doc.page.width;
doc.addPage();
doc.save()
  .transform(0, scale, -scale, 0, doc.page.width, 0)
  .formXObject('notebookPage')
  .restore();
doc.save()
  .transform(0, scale, -scale, 0, doc.page.width, doc.page.height / 2)
  .formXObject('notebookPage')
  .restore();

doc.end();