import {
	Sequence,
	SequenceCallback,
} from "./sequences/sequence";
import {IntegerSequence} from "./sequences/integer-sequence";
import {StringSequence} from "./sequences/string-sequence";

import {
	isFunction,
	isNumber,
	isPlainObject,
	isString,
} from "lodash";

export class SequenceHandler {
	sequences: Record<string, Sequence>;

	constructor() {
		this.sequences = {};
	}

	registerSequence(sequenceName: string, ...rest: any[]): Sequence {
		const options = optionsParser(...rest);
		const newSequence = sequenceChooser(sequenceName, options);

		for (const name of newSequence.names()) {
			if (this.sequences[name]) {
				throw new Error(`Can't define ${name} sequence twice`);
			}
			this.sequences[name] = newSequence;
		}

		return newSequence;
	}

	resetSequences(): void {
		Object.values(this.sequences).forEach((seq) => seq.reset());
	}

	findSequence(name: string): Sequence | undefined {
		return this.sequences[name];
	}
}

interface SequenceOptions {
	initial?: string | number;
	aliases?: string[];
	callback?: SequenceCallback<any>;
}

export function optionsParser(...args: any[]): SequenceOptions {
	const options = {} as SequenceOptions;
	for (const arg of args) {
		if ((isNumber(arg) || isString(arg)) && !options.initial) {
			options.initial = arg;
		} else if ((isPlainObject(arg) && arg.aliases) && !options.aliases) {
			options.aliases = [...arg.aliases];
		} else if (isFunction(arg) && !options.callback) {
			options.callback = arg;
		}
	}
	return options;
}

export function sequenceChooser(name: string, options: SequenceOptions): Sequence {
	let newSequence: Sequence;
	if (isString(options.initial)) {
		newSequence = new StringSequence(name, options);
	} else {
		newSequence = new IntegerSequence(name, options);
	}
	return newSequence;
}
