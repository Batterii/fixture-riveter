import { Factory } from './factory';

export class FactoryBuilder {
	factories: object;

	constructor() {
		this.factories = {};
	}

	define(
		name: string,
		model: object,
	): any {
		if (this.factories[name]) {
			throw new Error(`${name} already defined`);
		}

		const factory = new Factory(name, model);

		this.factories[name] = factory;

		return factory;
	}

	getFactory(name: string, throws = true): any {
		const factory = this.factories[name];
		if (throws && !this.factories[name]) {
			throw new Error(`${name} hasn't been defined yet`);
		}
		return factory;
	}
}
