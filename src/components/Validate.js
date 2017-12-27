class Validate {
  isValidate;
  item;
  name;

  constructor() {
    this.isValidate = true;
    this.item = '';
    this.name = '';
  }

  field(name, item) {
    this.name = name;
    this.item = item;
    return this;
  }

  required() {
    if(this.item.value === '' && this.isValidate) {
      alert(this.name + ' is required');
      this.item.focus();
      this.isValidate = false;
    }
    return this;
  }

  value() {
    return this.item.value;
  }
}

export default Validate;
