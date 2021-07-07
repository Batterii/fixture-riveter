// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Attribute} from "./attribute";
import {Evaluator} from "../evaluator";

export class RelationAttribute extends Attribute {
	fixture: string[];
	overrides: any[];

	constructor(name: string, fixture: string | string[], overrides: any[]) {
		super(name, false);
		this.fixture = Array.isArray(fixture) ? fixture : [fixture];
		this.overrides = overrides;
		this.isRelation = true;
	}

	evaluate(): (evaluator: Evaluator) => Promise<Record<string, any>> {
		const traitsAndOverrides = Array.prototype.concat(this.fixture, this.overrides);
		const fixtureName = traitsAndOverrides.shift();

		return async(evaluator: Evaluator) => {
			return evaluator.relation(fixtureName, ...traitsAndOverrides);
		};
	}
}
