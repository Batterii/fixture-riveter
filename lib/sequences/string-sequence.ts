import {Sequence} from '../sequence';


export class StringSequence extends Sequence {
	// Adapted from Stack Overflow: https://stackoverflow.com/a/12504061/3023252

	initialIndex: number;
	indicies: number[];
	alphabet: string;

	constructor(initChar = 'a') {
		super();
		this.alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

		const index = this.generateInitialIndex(initChar);
		this.initialIndex = index;
		this.indicies = [index];
	}

	generateInitialIndex(initChar?: string): number {
		let index = initChar ? this.alphabet.indexOf(initChar) : this.initialIndex;
		if (index === -1) {
			index = 0;
		}
		return index;
	}

	reset(character?: string): void {
		this.indicies = [this.generateInitialIndex(character)];
	}

	increment(): void {
		// given alphabet has length 5:
		// [0] becomes [1]
		// [4] becomes [5] becomes [0, 0]
		// [5, 5] becomes [0, 0, 0]
		for (let i = 0; i < this.indicies.length; i++) {
			this.indicies[i]++;
			if (this.indicies[i] >= this.alphabet.length) {
				this.indicies[i] = 0;
			} else {
				return;
			}
		}
		this.indicies.push(0);
	}

	next(callback?: Function): string {
		const result = this.indicies
			.map((idx) => this.alphabet[idx])
			.reverse()
			.join('');

		this.increment();

		return callback ? callback(result) : result;
	}
}
