import {Adapter} from "../adapters/adapter";
import {Assembler} from "../assembler";
import {FactoryBuilder} from "../factory-builder";

export abstract class Strategy {
	adapter: Adapter;
	factoryBuilder: FactoryBuilder;
	name: string;

	constructor(name: string, factoryBuilder: FactoryBuilder, adapter: Adapter) {
		this.name = name;
		this.adapter = adapter;
		this.factoryBuilder = factoryBuilder;
	}

	abstract association(factoryName: string, traitsAndOverrides: any[]): Promise<any>;
	abstract result(assembler: Assembler, model?: any): Promise<any>;
}
