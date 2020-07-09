import {Sequence} from "./sequence";

import {sample} from "lodash";

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
export class OneOfSequence extends Sequence {
	choices: any[];

	constructor(name: string, choices: any[], options?: any) {
		super(name, options);
		if (!choices || choices.length < 1) {
			throw new Error("OneOfSequence requires a positive number of values in choices");
		}
		this.choices = choices;
	}

	increment(): void { }

	reset(): void { }

	next(): number {
		const result = sample(this.choices);
		return this.callback(result);
	}
}
