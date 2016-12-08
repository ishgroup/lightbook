class Toggle {
  static Slide(state, id, time = 4) {
    let intval = null;
    const mdiv = document.getElementById(id);

    let h = mdiv.getElementsByTagName('div')[0].offsetHeight;
    let initHeight = 0;

    if(state) {
      intval = setInterval(function(){
        h -= 4;
        mdiv.style.height = h + 'px';
          if(h <= 0) {
            window.clearInterval(intval);
            mdiv.style.height = '0px';
            mdiv.style.display = 'none';
          }
        }, time
      );
    }
    else {
      h = 0;
      mdiv.style.display = 'block';
      initHeight = mdiv.getElementsByTagName('div')[0].offsetHeight + 10;

      intval = setInterval(function(){
        h += 4;
        mdiv.style.height = h + 'px';
          if(h >= initHeight) {
            window.clearInterval(intval);
            mdiv.style.height = initHeight + 'px';
          }
        }, time
      );
    }
  }
}

export default Toggle;