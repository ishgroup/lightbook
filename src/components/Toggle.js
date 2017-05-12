class Toggle {
	static Slide(state, id, time = 4) {
		let intval = null;
		const div = document.getElementById(id);

		if(div !== null && div !== undefined) {
			let h = div.getElementsByTagName('div')[0].offsetHeight;
			let initHeight = 0;

			if (state) {
				intval = setInterval(function () {
						h -= 4;
						div.style.height = h + 'px';
						if (h <= 0) {
							window.clearInterval(intval);
							div.style.height = '0px';
							div.style.display = 'none';
						}
					}, time
				);
			}
			else {
				h = 0;
				div.style.display = 'block';
				initHeight = div.getElementsByTagName('div')[0].offsetHeight + 10;

				intval = setInterval(function () {
						h += 4;
						div.style.height = h + 'px';
						if (h >= initHeight) {
							window.clearInterval(intval);
							div.style.height = initHeight + 'px';
						}
					}, time
				);
			}
		}
	}
}

export default Toggle;