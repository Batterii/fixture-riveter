import {Attribute} from "./attribute";
import {Definition} from "./definition";
import {FactoryBuilder} from "./factory-builder";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
export class NullFactory extends Definition {
	model: any;

	constructor(factoryBuilder: FactoryBuilder) {
		super("nullFactory", factoryBuilder);
	}

	compile(): void { }

	getAttributes(): Attribute[] {
		return [];
	}
}
