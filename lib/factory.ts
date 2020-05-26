class Factory {
	factories: object;
	options: object;
	created: unknown;

	constructor(options: object = {}) {
		this.factories = {};
		this.options = options;
	}

	define(
		name: string,
		model: object,
		// initializer: unknown,
		// options: object = {},
	): void {
		if (this.factories[name]) {
			throw new Error(`${name} already defined`);
		}

		this.factories[name] = model;
	}

	getFactory(name: string, throws = true): any {
		const factory = this.factories[name];
		if (throws && !this.factories[name]) {
			throw new Error(`${name} hasn't been defined yet`);
		}
		return factory;
	}
}

export { Factory };
