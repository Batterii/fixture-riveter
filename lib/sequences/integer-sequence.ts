import {Sequence} from '../sequence';

export class IntegerSequence extends Sequence {
	initialNumber: number;
	index: number;

	constructor(initialNumber = 1) {
		super();
		this.initialNumber = initialNumber;
		this.index = initialNumber;
	}

	increment(): void {
		this.index++;
	}

	reset(): void {
		this.index = this.initialNumber;
	}

	next(callback?: Function): number {
		const result = this.index;
		this.increment();
		return callback ? callback(result) : result;
	}
}
