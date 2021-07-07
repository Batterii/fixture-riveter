// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Attribute} from "./attribute";
import {Evaluator} from "../evaluator";

export type AttributeBlock = (evaluator: Evaluator) => any;

export class DynamicAttribute extends Attribute {
	block: AttributeBlock;

	constructor(name: string, ignored: boolean, block: AttributeBlock) {
		super(name, ignored);
		this.block = block;
	}

	evaluate(): (evaluator: Evaluator) => any {
		return (evaluator: Evaluator) => {
			return this.block.call(evaluator, evaluator);
		};
	}
}
