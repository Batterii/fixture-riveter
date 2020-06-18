import {Declaration} from "../declaration";
import {DynamicAttribute} from "../attributes/dynamic-attribute";

export class DynamicDeclaration extends Declaration {
	block: Function;

	constructor(name: string, block: Function) {
		super(name);
		this.block = block;
	}

	build(): DynamicAttribute[] {
		return [new DynamicAttribute(this.name, this.block)];
	}
}