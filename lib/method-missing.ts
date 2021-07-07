// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

// This is loosely based on https://github.com/ramadis/unmiss, but that library didn't
// work so here we are.

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function addMethodMissing(definitionProxy: any): any {
	const handler = {
		get(target: any, prop: string, receiver: any) {
			if (Reflect.has(target, prop) || prop === "methodMissing") {
				return Reflect.get(target, prop, receiver);
			}
			return function(...args: any[]) {
				return Reflect.get(target, "methodMissing").call(receiver, prop, ...args);
			};
		},
	};
	return new Proxy(definitionProxy, handler);
}
