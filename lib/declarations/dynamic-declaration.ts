// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Declaration} from "./declaration";
import {
	AttributeBlock,
	DynamicAttribute,
} from "../attributes/dynamic-attribute";

export class DynamicDeclaration extends Declaration {
	block: AttributeBlock;

	constructor(name: string, ignore: boolean, block: AttributeBlock) {
		super(name, ignore);
		this.block = block;
	}

	build(): DynamicAttribute[] {
		return [new DynamicAttribute(this.name, this.ignored, this.block)];
	}
}
