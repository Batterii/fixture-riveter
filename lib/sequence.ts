import {first, isFunction, isNumber, isObjectLike, isPlainObject, isString} from "lodash";

export type SequenceCallback<C> = (result: C) => any;

export type SequenceOptions = {
	aliases?: string[];
	gen?: (() => Generator<any, any, any>);
	initial?: undefined,
} | {
	aliases?: string[];
	gen?: undefined;
	initial?: string | number;
};

export class Sequence {
	name: string;
	baseGenerator: () => Generator<any, any, any>;
	initialValue: any;
	generator: Generator<any, any, any>;
	value: any;
	aliases: string[];
	callback: SequenceCallback<any>;

	constructor(name: string, ...args: any[]) {
		this.name = name;

		const {aliases, baseGenerator, callback, initial} = optionsParser(name, ...args);
		this.aliases = aliases;
		this.callback = callback;
		this.baseGenerator = baseGenerator;
		this.generator = this.baseGenerator();
		this.value = initial;
		this.initialValue = initial;
	}

	names(): string[] {
		return [this.name, ...this.aliases];
	}

	next(): any {
		const result = this.value;
		this.value = this.generator.next().value;
		return this.callback(result);
	}

	reset(): void {
		this.generator = this.baseGenerator();
		this.value = this.initialValue;
	}

	*[Symbol.iterator](): any {
		while (true) {
			yield this.next();
		}
	}
}

interface SequenceConstructorOptions {
	aliases: string[];
	baseGenerator: (() => Generator<any, any, any>);
	callback: SequenceCallback<any>;
	initial?: any;
}

export function optionsParser(name: string, ...args: any[]): SequenceConstructorOptions {
	const options: Partial<SequenceConstructorOptions> = {};

	// inline initial value or generator function
	const initialOrGen = first(args);
	if (isNumber(initialOrGen)) {
		const gen = args.shift();
		options.initial = gen;
		options.baseGenerator = () => numberGen(gen);
	} else if (isString(initialOrGen)) {
		const gen = args.shift();
		options.initial = gen;
		options.baseGenerator = () => stringGen(gen);
	} else if (isFunction(initialOrGen)) {
		const result = initialOrGen();
		if (isObjectLike(result) && Reflect.has(result, "next")) {
			options.baseGenerator = args.shift();
			options.initial = result.next().value;
		}
	}

	// everything in a big options map
	const optionsMap = first(args);
	if (isPlainObject(optionsMap)) {
		// Throw errors if the gen or initial value was provided inline (not in an object)
		if (Reflect.has(options, "gen") && Reflect.has(optionsMap, "gen")) {
			throw new Error(`Can't define two generator functions for sequence "${name}"`);
		}
		if (Reflect.has(options, "initial") && Reflect.has(optionsMap, "initial")) {
			throw new Error(`Can't define two initial values for sequence "${name}"`);
		}

		const {aliases, gen, initial} = args.shift();

		if (Array.isArray(aliases)) {
			if (!aliases.every((s) => isString(s))) {
				throw new Error(`Can't use non-string aliases for sequence "${name}"`);
			}
			options.aliases = aliases;
		}

		if (initial && gen) {
			throw new Error(
				`Can't provide both initial value and generator function for sequence "${name}"`,
			);
		}

		if (isNumber(initial)) {
			options.baseGenerator = () => numberGen(initial);
			options.initial = initial;
		} else if (isString(initial)) {
			options.baseGenerator = () => stringGen(initial);
			options.initial = initial;
		} else if (isFunction(gen)) {
			const result = gen();
			if (isObjectLike(result) && Reflect.has(result, "next")) {
				options.baseGenerator = gen;
				options.initial = result.next().value;
			}
		}
	}

	// inline final place callback function
	const inlineCallback = first(args);
	if (isFunction(inlineCallback)) {
		options.callback = args.shift();
	}

	// Set defaults
	if (!options.baseGenerator) {
		options.baseGenerator = () => numberGen(1);
		options.initial = 1;
	}
	if (!options.aliases) {
		options.aliases = [];
	}
	if (!options.callback) {
		options.callback = (x: any) => x;
	}

	if (args.length > 0) {
		throw new Error(`Incorrect options for sequence "${name}"`);
	}

	return options as SequenceConstructorOptions;
}

export function *numberGen(input: number): Generator<number, number, number> {
	let base = input;
	while (true) {
		base += 1;
		yield base;
	}
}

// Taken from: https://gist.github.com/devongovett/1081265
export function *stringGen(input: string): Generator<string, string, string> {
	const alphabet = "abcdefghijklmnopqrstuvwxyz";
	const length = 26;
	let current = input;

	while (true) {
		let result = current;
		let i = current.length;

		while (i >= 0) {
			i -= 1;
			const last = current.charAt(i);
			let next = "";
			let carry = false;

			if (isNaN(Number(last))) {
				const index = alphabet.indexOf(last.toLowerCase());

				if (index === -1) {
					next = last;
					carry = true;
				} else {
					const isUpperCase = last === last.toUpperCase();
					next = alphabet.charAt((index + 1) % length);
					if (isUpperCase) {
						next = next.toUpperCase();
					}

					carry = index + 1 >= length;
					if (carry && i === 0) {
						const added = isUpperCase ? "A" : "a";
						result = added + next + result.slice(1);
						break;
					}
				}
			} else {
				let nextNumber = parseInt(last, 10) + 1;
				if (nextNumber > 9) {
					nextNumber = 0;
					carry = true;
				}

				if (carry && (i === 0)) {
					result = `1${nextNumber}${result.slice(1)}`;
					break;
				}
			}

			result = result.slice(0, i) + next + result.slice(i + 1);
			if (!carry) {
				break;
			}
		}
		current = result;
		yield result;
	}
}
