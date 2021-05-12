import {Attribute} from "./attribute";
import {Sequence} from "../sequence";

export class SequenceAttribute extends Attribute {
	sequence: Sequence;

	constructor(name: string, ignored: boolean, sequence: Sequence) {
		super(name, ignored);
		this.sequence = sequence;
	}

	evaluate(): () => any {
		return () => this.sequence.next();
	}
}
