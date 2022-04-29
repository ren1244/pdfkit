import PDFFormXObject from '../form_xobject';

export default {
  initFormXObject() {
    this._formXObjectDict = {};
    this._formXObjectCount = 0;
  },
  addFormXObject(key, func, options) {
    if (this._formXObjectDict[key]) {
      throw 'Form XObject: duplicate key';
    }
    if (options == null) {
      ({ options } = this);
    }
    const tmpPage = this.page;
    // create a Form XObject
    this.page = new PDFFormXObject(this, options);
    this._formXObjectDict[key] = {
      xName: `FXOBJ${++this._formXObjectCount}`,
      ref: this.page.dictionary
    };
    // reset x, y and _ctm
    this.x = this.page.margins.left;
    this.y = this.page.margins.top;
    this._ctm = [1, 0, 0, 1, 0, 0];
    // to draw something
    func(this);
    this.endPageMarkings(this.page);
    this.page.end();
    this.page = tmpPage;

    return this;
  },
  formXObject(key) {
    if (this._formXObjectDict[key] == null) {
      throw 'Form XObject: cannot find content';
    }
    const formXObj = this._formXObjectDict[key];
    this.page.xobjects[formXObj.xName] = formXObj.ref;
    this.addContent(`/${formXObj.xName} Do`);
    return this;
  }
}
