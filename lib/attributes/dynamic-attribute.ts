import {Attribute} from "../attribute";
import {Evaluator} from "../evaluator";

export type AttributeBlock = (evaluator?: Evaluator) => any;

export class DynamicAttribute extends Attribute {
	block: AttributeBlock;

	constructor(name: string, block: AttributeBlock) {
		super(name);
		this.block = block;
	}

	evaluate(): (evaluator?: Evaluator) => any {
		return (evaluator?: Evaluator) => {
			return this.block.call(evaluator, evaluator);
		};
	}
}
