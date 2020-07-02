import {Evaluator} from "../evaluator";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
export abstract class Attribute {
	name: string;
	isAssociation: boolean;
	ignored: boolean;

	constructor(name: string, ignored: boolean) {
		this.name = name;
		this.isAssociation = false;
		this.ignored = ignored;
	}

	abstract evaluate(evaluator?: Evaluator): (e: Evaluator) => any;
}
