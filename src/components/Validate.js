class Validate {
  isValidate = true;
  item = '';
  name = '';

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