import {Adapter} from "../adapters/adapter";
import {CallbackHandler} from "../callback-handler";
import {FactoryBuilder} from "../factory-builder";

export abstract class Strategy {
	adapter: Adapter;
	factoryBuilder: FactoryBuilder;
	name: string;

	constructor(factoryBuilder: FactoryBuilder, adapter: Adapter) {
		this.adapter = adapter;
		this.factoryBuilder = factoryBuilder;
	}

	abstract association(factoryName: string, traitsAndOverrides: any[]): Promise<any>;
	abstract result(callbackHandler: CallbackHandler, model?: any): Promise<any>;
}
