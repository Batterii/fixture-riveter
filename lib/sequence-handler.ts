import {Sequence} from './sequences/sequence';
import {IntegerSequence} from './sequences/integer-sequence';
import {StringSequence} from './sequences/string-sequence';

import {
	isFunction,
	isNumber,
	isPlainObject,
	isString,
} from 'lodash';

export interface SequenceOptions {
	initial?: string | number;
	aliases?: string[];
	callback?: Function;
}

export class SequenceHandler {
	sequences: Sequence[];

	constructor() {
		this.sequences = [];
	}

	registerSequence(
		name: string,
		initial?: string | number,
		options?: {aliases: string[]},
		callback?: Function,
	): Sequence;

	registerSequence(name: string, ...rest: any[]): Sequence {
		const options = optionsParser(...rest);
		const newSequence = sequenceChooser(name, options);

		this.sequences.push(newSequence);
		return newSequence;
	}

	resetSequences(): void {
		this.sequences.forEach((seq) => seq.reset());
	}

	findSequence(name: string): Sequence | undefined {
		return this.sequences.find((s: Sequence) => s.name === name);
	}
}

type initial = string | number;
type options = {aliases: string[]};
type callback = Function;

export function optionsParser(
	initial?: initial | options | callback,
	options?: initial | options | callback,
	callback?: initial | options | callback,
): SequenceOptions;

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
