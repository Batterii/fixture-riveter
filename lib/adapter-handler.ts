import {Adapter, DefaultAdapter} from './adapters/default-adapter';

export type FactoryNames = string | string[];

export class AdapterHandler {
	adapters: Record<string, Adapter>;
	defaultAdapter: Adapter;
	currentAdapter: Adapter;

	constructor(adapter?: Adapter) {
		this.adapters = {};
		this.defaultAdapter = new DefaultAdapter();
		this.currentAdapter = adapter || this.defaultAdapter;
	}

	getAdapter(factoryName?: string): Adapter {
		if (factoryName && factoryName in this.adapters) {
			return this.adapters[factoryName];
		}
		return this.currentAdapter;
	}

	assignMultiple(adapter: Adapter, names: string[]): void {
		names.forEach((name) => {
			this.adapters[name] = adapter;
		});
	}

	// eslint-disable-next-line class-methods-use-this
	coerceNames(factoryNames?: FactoryNames): string[] {
		if (factoryNames) {
			return Array.isArray(factoryNames) ? factoryNames : [factoryNames];
		}
		return [];
	}

	setAdapters(adapter: Adapter, factoryNames: FactoryNames): void {
		const names = this.coerceNames(factoryNames);
		this.assignMultiple(adapter, names);
	}

	setAdapter(adapter: Adapter, factoryNames?: FactoryNames): Adapter {
		if (factoryNames) {
			this.setAdapters(adapter, factoryNames);
		} else {
			this.currentAdapter = adapter;
		}
		return adapter;
	}
}
