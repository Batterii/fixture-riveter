import { Factory } from './Factory';

export class FactoryBuilder {
	_factories: Record<string, Factory>;

	constructor() {
		this._factories = {};
	}

	define(block: Function): void {
		block.call(this);
	}

	getFactory(name: string, throws = true): Factory {
		const factory = this._factories[name];
		if (throws && !factory) {
			throw new Error(`${name} hasn't been defined yet`);
		}
		return factory;
	}

	registerFactory(factory: any): any {
		for (const name of factory.names()) {
			this._factories[name] = factory;
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
}
