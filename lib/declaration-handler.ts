// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Attribute} from "./attributes/attribute";
import {Declaration} from "./declarations/declaration";

export class DeclarationHandler {
	name: string;
	declarations: Declaration[];
	attributes?: Attribute[];

	constructor(name: string) {
		this.name = name;
		this.declarations = [];
	}

	declareAttribute(declaration: Declaration): Declaration {
		this.declarations.push(declaration);
		return declaration;
	}

	toAttributes(): Attribute[] {
		return this.declarations.flatMap((d) => d.build());
	}

	getAttributes(): Attribute[] {
		if (!this.attributes) {
			this.attributes = this.toAttributes();
		}
		return this.attributes;
	}
}
