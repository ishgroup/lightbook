import React, { Component } from "react";

class Row extends Component {
	linkHtml(item, type) {
		let key = item.replace(/(\D)*|(\s)*/g, "");
		if (type === "mailto")
			key = item.replace(/\s/g, "");

		return <a href={ type + ":" + key } className="mr-1" key={key}>{item.trim()}</a>;
	}

	render() {
		let lClass = (this.props.lClass || "col-sm-"+ (this.props.lWidth || '3') +" text-sm-right");
		let rClass = (this.props.rClass || "col-sm-" + (this.props.rWidth || '21'));
		const that = this;
		let rowItem = [];

		let item = this.props.item;
		if(this.props.link) {
			if(typeof item === "string" ) {
				rowItem.push([that.linkHtml(item, this.props.link)]);
			} else {
				if(item !== undefined) {
					item.forEach(function (value) {
						rowItem.push([that.linkHtml(value, that.props.link)]);
					});
				}
			}
		} else {
			rowItem = [item];
		}

		return (
			<React.Fragment>
				{(this.props.item && this.props.item !== 'null') ?
					<div className="form-group row">
						<div className={lClass}>{this.props.label}:</div>
						<div className={rClass}>
							{this.props.children ? this.props.children : rowItem }
						</div>
					</div>
				: ''}
			</React.Fragment>
		);
	}
}

export default Row;
