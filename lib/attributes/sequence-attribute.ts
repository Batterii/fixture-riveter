// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Attribute} from "./attribute";
import {Sequence} from "../sequence";

export class SequenceAttribute extends Attribute {
	sequence: Sequence;

	constructor(name: string, ignored: boolean, sequence: Sequence) {
		super(name, ignored);
		this.sequence = sequence;
	}

	evaluate(): () => any {
		return () => this.sequence.next();
	}
}
