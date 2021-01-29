import {isFunction, isNumber, isObject, isString} from "lodash";

export type SequenceCallback<C> = (result: C) => any;

export class Sequence<C extends string | number | (() => Generator<any, any, any>)> {
	name: string;
	baseGenerator: () => Generator<any, any, any>;
	initialValue: any;
	generator: Generator<any, any, any>;
	value: any;
	aliases: string[];
	callback: SequenceCallback<any>;

	constructor(
		sequenceName: string,
		options?: C | string[] | SequenceCallback<number>,
	);

	constructor(
		sequenceName: string,
		initial: C,
		aliasesOrCallback?: (
			| string[]
			| SequenceCallback<C extends (() => Generator<infer T, any, any>) ? T : C>
		),
	);

	constructor(
		sequenceName: string,
		initialOrAliases: C | string[],
		callback?: SequenceCallback<C extends (() => Generator<infer T, any, any>) ? T : C>
	);

	constructor(
		sequenceName: string,
		initial: C,
		aliases: string[],
		callback?: SequenceCallback<C extends (() => Generator<infer T, any, any>) ? T : C>
	);

	constructor(name: string, ...args: any[]) {
		this.name = name;

		const options = optionsParser(name, ...args);
		this.aliases = options.aliases || [];
		this.callback = options.callback || ((x: any) => x);

		const {gen} = options;
		if (isString(gen)) {
			this.baseGenerator = () => stringGen(gen);
			this.value = gen;
		} else if (isNumber(gen)) {
			this.baseGenerator = () => numberGen(gen);
			this.value = gen;
		} else if (isFunction(gen)) {
			this.baseGenerator = () => gen();
		} else {
			this.baseGenerator = () => numberGen(1);
			this.value = 1;
		}
		this.generator = this.baseGenerator();

		if (!this.value) {
			this.value = this.generator.next().value;
		}
		this.initialValue = this.value;
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

export interface SequenceOptions {
	gen?: string | number | (() => Generator<any, any, any>);
	aliases?: string[];
	callback?: SequenceCallback<any>;
}

export function optionsParser(name: string, ...args: any[]): SequenceOptions {
	const options: SequenceOptions = {};

	const [gen] = args;
	if (isNumber(gen) || isString(gen)) {
		options.gen = args.shift();
	} else if (isFunction(gen)) {
		const result = gen();
		if (isObject(result) && Reflect.has(result, "next")) {
			options.gen = args.shift();
		}
	}

	const [aliases] = args;
	if (Array.isArray(aliases) && aliases.every((s) => isString(s))) {
		options.aliases = args.shift();
	}

	const [fn] = args;
	if (isFunction(fn)) {
		options.callback = args.shift();
	}

	if (args.length > 0) {
		throw new Error(`Incorrect sequence options for "${name}"`);
	}

	return options;
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
