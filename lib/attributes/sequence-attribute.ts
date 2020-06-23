import {Attribute} from "../attribute";
import {Sequence} from "../sequences/sequence";

export class SequenceAttribute extends Attribute {
	sequence: Sequence;

	constructor(name: string, sequence: Sequence) {
		super(name);
		this.sequence = sequence;
	}

	evaluate(): () => string | number {
		return () => this.sequence.next();
	}
}
