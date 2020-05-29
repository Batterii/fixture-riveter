import { Factory } from './Factory';

export class FactoryBuilder {
	_factories: Record<string, Factory>;

	constructor() {
		this._factories = {};
	}

	getFactory(name: string, throws = true): Factory {
		const factory = this._factories[name];
		if (throws && !factory) {
			throw new Error(`${name} hasn't been defined yet`);
		}
		return factory;
	}

	// define(name: string, model: object, block: unknown): any {
	// 	if (this.getFactory(name, false)) {
	// 		throw new Error(`${name} is already defined`);
	// 	}

	// 	const factory = new Factory(name, model, block);

	// 	this._factories[name] = factory;

	// 	return factory;
	// }

	define(block: Function): void {
		block.call(this);
	}

	registerFactory(factory: any): any {
		for (const name of factory.names()) {
			this._factories[name] = factory;
		}
	}

	factory(name: string, model: object, block?: Function): Factory {
		if (this.getFactory(name, false)) {
			throw new Error(`${name} is already defined`);
		}

		const factory = new Factory(name, model, block);

		this.registerFactory(factory);

		return factory;
	}
}
