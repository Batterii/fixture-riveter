// This is loosely based on https://github.com/ramadis/unmiss, but that library didn't
// work so here we are.

export function addMethodMissing(definitionProxy: any): any {
	const handler = {
		get(target: any, prop: string, receiver: any) {
			if (Reflect.has(target, prop) || prop === "_methodMissing") {
				return Reflect.get(target, prop, receiver);
			}
			return function(...args: any[]) {
				return Reflect.get(target, "_methodMissing").call(target, prop, ...args);
			};
		},
	};
	return new Proxy(definitionProxy, handler);
}
