import {Evaluator} from "./evaluator";
import {FactoryBuilder} from "./factory-builder";

export type callbackFunction = (instance: any, evaluator: Evaluator) => any;

export class Callback {
	factoryBuilder: FactoryBuilder;
	name: string;
	block: callbackFunction;

	constructor(factoryBuilder: FactoryBuilder, name: string, block: callbackFunction) {
		this.factoryBuilder = factoryBuilder;
		this.name = name;
		this.block = block;
	}

	async run(instance: any, evaluator: Evaluator): Promise<any> {
		return this.block.call(this.factoryBuilder, instance, evaluator);
	}
}
