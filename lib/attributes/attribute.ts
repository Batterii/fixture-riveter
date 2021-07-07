// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Evaluator} from "../evaluator";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
export abstract class Attribute {
	name: string;
	isRelation: boolean;
	ignored: boolean;

	constructor(name: string, ignored: boolean) {
		this.name = name;
		this.isRelation = false;
		this.ignored = ignored;
	}

	abstract evaluate(): (e: Evaluator) => any;
}
