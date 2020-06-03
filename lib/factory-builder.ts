import {AdapterHandler, FactoryNames} from './adapter-handler';
import {ExtraAttributes, Factory} from './factory';

export class FactoryBuilder {
	factories: Record<string, Factory>;
	adapters: any;

	constructor() {
		this.factories = {};
		this.adapters = new AdapterHandler();
	}

	getAdapter(factoryName?: string): any {
		return this.adapters.getAdapter(factoryName);
	}

	setAdapter(adapter: any, factoryNames?: FactoryNames): any {
		return this.adapters.setAdapter(adapter, factoryNames);
	}

	define(block: Function): void {
		block.call(this);
	}

	getFactory(name: string, throws = true): Factory {
		const factory = this.factories[name];
		if (throws && !factory) {
			throw new Error(`${name} hasn't been defined yet`);
		}
		return factory;
	}

	registerFactory(factory: any): any {
		for (const name of factory.names()) {
			this.factories[name] = factory;
		}
	}

	factory(name: string, model: object, ...rest: any): Factory {
		if (this.getFactory(name, false)) {
			throw new Error(`${name} is already defined`);
		}

		const factory = new Factory(name, model, ...rest);

		factory.compile();

		this.registerFactory(factory);

		return factory;
	}

	async build(name: string, extraAttributes?: ExtraAttributes): Promise<any> {
		const adapter = this.getAdapter();
		const factory = this.getFactory(name);
		const instance = await factory.build(adapter, extraAttributes);

		return instance;
	}
}
