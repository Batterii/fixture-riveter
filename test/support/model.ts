// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {mixin, Model as ObjectionModel} from "objection";
import tableNamer from "objection-table-name";

export class Model extends mixin(ObjectionModel, [tableNamer()]) {
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
