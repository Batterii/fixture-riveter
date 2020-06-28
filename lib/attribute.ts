import {Evaluator} from "./evaluator";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
export abstract class Attribute {
	name: string;
	isAssociation: boolean;

	constructor(name: string) {
		this.name = name;
		this.isAssociation = false;
	}

	abstract evaluate(evaluator?: Evaluator): (e: Evaluator) => any;
}
