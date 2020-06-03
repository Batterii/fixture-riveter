import {DefaultAdapter} from './adapters/default-adapter';

export type FactoryNames = string | string[];

export class AdapterHandler {
	adapters: Record<string, any>;
	defaultAdapter: any;
	currentAdapter: any;

	constructor(adapter?: any) {
		this.adapters = {};
		this.defaultAdapter = new DefaultAdapter();
		this.currentAdapter = adapter || this.defaultAdapter;
	}

	getAdapter(factoryName?: string): any {
		if (factoryName && factoryName in this.adapters) {
			return this.adapters[factoryName];
		}
		return this.currentAdapter;
	}

	setAdapters(adapter: any, factoryNames?: FactoryNames): void {
		const names = coerceNames(factoryNames);

		names.forEach((name) => {
			this.adapters[name] = adapter;
		});
	}

	setAdapter(adapter: any, factoryName?: any): any {
		if (factoryName) {
			this.setAdapters(adapter, factoryName);
		} else {
			this.currentAdapter = adapter;
		}
		return adapter;
	}
}

function coerceNames(factoryNames?: FactoryNames): string[] {
	if (factoryNames) {
		return Array.isArray(factoryNames) ? factoryNames : [factoryNames];
	}
	return [];
}
