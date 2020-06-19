import {Attribute} from "./attribute";
import {Definition} from "./definition";
import {FactoryBuilder} from "./factory-builder";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
export class NullFactory extends Definition {
	model: any;

	constructor(
		factoryBuilder: FactoryBuilder,
		model: any,
	) {
		super("nullFactory", factoryBuilder);
		this.model = model;
	}

	names(): string[] {
		return [this.name];
	}

	attributeNames(): string[] {
		return [];
	}

	getParentAttributes(): Attribute[] {
		return [];
	}

	getAttributes(): Attribute[] {
		return [];
	}

	applyAttributes(): Record<string, any> {
		return {};
	}
}
