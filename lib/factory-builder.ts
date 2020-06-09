import {Adapter} from './adapters/adapter';
import {AdapterHandler, FactoryNames} from './adapter-handler';
import {ExtraAttributes, FactoryOptions, Factory} from './factory';

export class FactoryBuilder {
	factories: Record<string, Factory>;
	adapterHandler: any;

	constructor() {
		this.factories = {};
		this.adapterHandler = new AdapterHandler();
	}

	getAdapter(factoryName?: string): Adapter {
		return this.adapterHandler.getAdapter(factoryName);
	}

	setAdapter(adapter: Adapter, factoryNames?: FactoryNames): Adapter {
		return this.adapterHandler.setAdapter(adapter, factoryNames);
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

	registerFactory(factory: Factory): void {
		for (const name of factory.names()) {
			this.factories[name] = factory;
		}
	}

	factory(name: string, model: object, rest?: FactoryOptions | Function): Factory;
	factory(name: string, model: object, ...rest: any[]): Factory {
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
		return factory.build(adapter, extraAttributes);
	}

	async create(name: string, extraAttributes?: ExtraAttributes): Promise<any> {
		const adapter = this.getAdapter();
		const factory = this.getFactory(name);
		return factory.create(adapter, extraAttributes);
	}

	attributesFor(name: string, extraAttributes?: ExtraAttributes): any {
		return this.getFactory(name).applyAttributes(extraAttributes);
	}
}
