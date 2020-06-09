import {Sequence} from './sequence';

export class IntegerSequence extends Sequence {
	initialNumber: number;
	index: number;

	constructor(name: string, options?: any) {
		super(name, options);
		this.initialNumber = (options && options.initial) || 1;
		this.index = this.initialNumber;
	}

	increment(): void {
		this.index++;
	}

	reset(): void {
		this.index = this.initialNumber;
	}

	next(): number {
		const result = this.index;
		this.increment();
		return this.callback(result);
	}
}
