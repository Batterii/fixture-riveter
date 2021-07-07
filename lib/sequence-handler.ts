// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Sequence} from "./sequence";

export class SequenceHandler {
	sequences: Map<string, Sequence>;

	constructor() {
		this.sequences = new Map();
	}

	registerSequence(sequenceName: string, ...rest: any[]): Sequence {
		const newSequence = new Sequence(sequenceName, ...rest);

		for (const name of newSequence.names()) {
			if (this.sequences.has(name)) {
				throw new Error(`Can't define ${name} sequence twice`);
			}
			this.sequences.set(name, newSequence);
		}

		return newSequence;
	}

	resetSequences(): void {
		this.sequences.forEach((seq) => seq.reset());
	}

	findSequence(name: string): Sequence | undefined {
		return this.sequences.get(name);
	}
}
