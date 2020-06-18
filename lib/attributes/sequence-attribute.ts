import {Attribute} from '../attribute';
import {Sequence} from '../sequences/sequence';

export class SequenceAttribute extends Attribute {
	sequence: Sequence;

	constructor(name: string, sequence: Sequence) {
		super(name);
		this.sequence = sequence;
	}

	build(): Function {
		return () => this.sequence.next();
	}
}
