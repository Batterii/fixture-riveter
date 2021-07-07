// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Declaration} from "./declaration";
import {RelationAttribute} from "../attributes/relation-attribute";
import {extractOverrides} from "../fixture-riveter";

import {omit} from "lodash";

export class RelationDeclaration extends Declaration {
	overrides: Record<string, any>;
	traits: string[];

	constructor(name: string, traitsAndOptions: any[]) {
		super(name);
		this.overrides = extractOverrides(traitsAndOptions);
		this.traits = traitsAndOptions;
	}

	build(): RelationAttribute[] {
		const fixtureName = this.overrides.fixture || this.name;
		const overrides = omit(this.overrides, "fixture");
		const options = [this.traits, overrides].flat(Infinity);

		return [new RelationAttribute(this.name, fixtureName, options)];
	}
}
