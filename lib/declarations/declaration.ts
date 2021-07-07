// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Attribute} from "../attributes/attribute";

export abstract class Declaration {
	name: string;
	ignored: boolean;

	constructor(name: string, ignored = false) {
		this.name = name;
		this.ignored = ignored;
	}

	abstract build(): Attribute[];
}
