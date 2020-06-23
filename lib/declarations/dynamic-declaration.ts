import {Declaration} from "../declaration";
import {
	AttributeBlock,
	DynamicAttribute,
} from "../attributes/dynamic-attribute";

export class DynamicDeclaration extends Declaration {
	block: AttributeBlock;

	constructor(name: string, block: AttributeBlock) {
		super(name);
		this.block = block;
	}

	build(): DynamicAttribute[] {
		return [new DynamicAttribute(this.name, this.block)];
	}
}
