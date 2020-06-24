import {Adapter} from "../adapters/adapter";
import {FactoryBuilder} from "../factory-builder";

export abstract class Strategy {
	adapter: Adapter;
	factoryBuilder: FactoryBuilder;
	name: string;

	constructor(factoryBuilder: FactoryBuilder, adapter: Adapter) {
		this.adapter = adapter;
		this.factoryBuilder = factoryBuilder;
	}

	abstract run(instance: any, model?: any): Promise<any>;
	abstract association(factoryName: string, traitsAndOverrides: any[]): Promise<any>;
}
