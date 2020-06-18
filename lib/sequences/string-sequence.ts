import {Sequence} from "./sequence";

export class StringSequence extends Sequence {
	// Adapted from Stack Overflow: https://stackoverflow.com/a/12504061/3023252

	initialChar: string;
	indicies: number[];
	alphabet: string;

	constructor(name: string, options?: any) {
		super(name, options);
		this.alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

		const initChar = (options && options.initial) || "a";
		this.initialChar = initChar;
		this.indicies = this.generateInitialIndex(initChar);
	}

	generateInitialIndex(initChar?: string): number[] {
		const character = initChar || this.initialChar;
		let index = this.alphabet.indexOf(character);
		if (index === -1) {
			index = 0;
		}
		return [index];
	}

	reset(character?: string): void {
		this.indicies = this.generateInitialIndex(character);
	}

	increment(): void {
		// given alphabet has length 5:
		// [0] becomes [1]
		// [4] becomes [5] becomes [0, 0]
		// [0, 0] becomes [1, 0]
		// [4, 0] becomes [5, 0] becomes [0, 1]
		// [4, 4] becomes [5, 5] becomes [0, 0, 0]
		for (let i = 0; i < this.indicies.length; i += 1) {
			this.indicies[i] += 1;
			if (this.indicies[i] >= this.alphabet.length) {
				this.indicies[i] = 0;
			} else {
				return;
			}
		}
		this.indicies.push(0);
	}

	next(): string {
		const result = this.indicies
			.map((idx) => this.alphabet[idx])
			.reverse()
			.join("");

		this.increment();

		return this.callback(result);
	}
}
