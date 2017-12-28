class Toggle {
	static Slide(state, id) {

		const div = document.getElementById(id);

		if(div !== null && div !== undefined) {
			if(!state)
				div.setAttribute("style", "height: "+ div.getElementsByTagName('div')[0].offsetHeight +"px !important");
			else
				div.setAttribute("style", "height: 0px !important");
		}
	}
}

export default Toggle;
