import {Model as ObjectionModel} from "objection";

export class Model extends ObjectionModel {
	get props() {
		return {};
	}

	$parseDatabaseJson(json: any) {
		json = super.$parseDatabaseJson(json);
		for (const [key, value] of Object.entries(json)) {
			if (
				Object.prototype.hasOwnProperty.call(this.props, key) &&
				this.props[key] === "boolean"
			) {
				json[key] = value === 1;
			}
		}
		return json;
	}
}
