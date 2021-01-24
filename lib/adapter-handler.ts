import {Adapter} from "./adapters/adapter";
import {DefaultAdapter} from "./adapters/default-adapter";

export type FixtureNames = string | string[];

export class AdapterHandler {
	adapters: Record<string, Adapter>;
	defaultAdapter: Adapter;
	currentAdapter: Adapter;

	constructor(adapter?: Adapter) {
		this.adapters = {};
		this.defaultAdapter = new DefaultAdapter();
		this.currentAdapter = adapter || this.defaultAdapter;
	}

	getAdapter(fixtureName?: string): Adapter {
		if (fixtureName && fixtureName in this.adapters) {
			return this.adapters[fixtureName];
		}
		return this.currentAdapter;
	}

	assignMultiple(adapter: Adapter, names: string[]): void {
		names.forEach((name) => {
			this.adapters[name] = adapter;
		});
	}

	setAdapters(adapter: Adapter, fixtureNames?: FixtureNames): void {
		const names = coerceNames(fixtureNames);
		this.assignMultiple(adapter, names);
	}

	setAdapter(adapter: Adapter, fixtureNames?: FixtureNames): Adapter {
		if (fixtureNames) {
			this.setAdapters(adapter, fixtureNames);
		} else {
			this.currentAdapter = adapter;
		}
		return adapter;
	}
}

export function coerceNames(fixtureNames?: FixtureNames): string[] {
	if (fixtureNames) {
		return Array.isArray(fixtureNames) ? fixtureNames : [fixtureNames];
	}
	return [];
}
