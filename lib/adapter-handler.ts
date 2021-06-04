// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Adapter} from "./adapters/adapter";
import {DefaultAdapter} from "./adapters/default-adapter";

export class AdapterHandler {
	adapters: Map<string, Adapter>;
	currentAdapter: Adapter;

	constructor(adapter?: Adapter) {
		this.adapters = new Map();
		this.currentAdapter = adapter || new DefaultAdapter();
	}

	getAdapter(fixtureName?: string): Adapter {
		if (fixtureName) {
			if (this.adapters.has(fixtureName)) {
				return this.adapters.get(fixtureName)!;
			}
		}
		return this.currentAdapter;
	}

	setAdapters(adapter: Adapter, names?: string | string[]): void {
		coerceNames(names).forEach((name) => {
			this.adapters.set(name, adapter);
		});
	}

	setAdapter(adapter: Adapter, names?: string | string[]): Adapter {
		if (names) {
			this.setAdapters(adapter, names);
		} else {
			this.currentAdapter = adapter;
		}
		return adapter;
	}
}

export function coerceNames(names?: string | string[]): string[] {
	if (names) {
		return Array.isArray(names) ? names : [names];
	}
	return [];
}
