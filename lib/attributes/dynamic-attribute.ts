import {Attribute} from "../attribute";

export class DynamicAttribute extends Attribute {
	block: Function;

	constructor(name: string, block: Function) {
		super(name);
		this.block = block;
	}

	build(): Function {
		return (f: any) => {
			return this.block.call(f, f);
		};
	}
}
