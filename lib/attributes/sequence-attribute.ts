import {Attribute} from "./attribute";
import {Sequence} from "../sequence";

export class SequenceAttribute extends Attribute {
	sequence: Sequence<any>;

	constructor(name: string, ignored: boolean, sequence: Sequence<any>) {
		super(name, ignored);
		this.sequence = sequence;
	}

	evaluate(): () => any {
		return () => this.sequence.next();
	}
}
