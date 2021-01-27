import {
	CallbackFunction,
	Callback,
} from "./callback";
import {FixtureRiveter} from "./fixture-riveter";

import {isFunction} from "lodash";

export class CallbackHandler {
	callbacks: Callback<any>[];
	fixtureRiveter: FixtureRiveter;

	constructor(fixtureRiveter: FixtureRiveter) {
		this.callbacks = [];
		this.fixtureRiveter = fixtureRiveter;
	}

	addCallback<T>(names: string[], block: CallbackFunction<T>): void {
		for (const name of names) {
			this.callbacks.push(new Callback(this.fixtureRiveter, name, block));
		}
	}

	before<T>(...rest: any[]): void {
		const block = extractCallbackFunction<T>(rest);
		const names = rest.map((n: string) => {
			const string = n.charAt(0).toUpperCase() + n.slice(1);
			return `before${string}`;
		});
		this.addCallback(names, block);
	}

	after<T>(...rest: any[]): void {
		const block = extractCallbackFunction<T>(rest);
		const names = rest.map((n: string) => {
			const string = n.charAt(0).toUpperCase() + n.slice(1);
			return `after${string}`;
		});
		this.addCallback(names, block);
	}
}

export function extractCallbackFunction<T>(rest: any[]): CallbackFunction<T> {
	const block = rest.pop();
	if (!isFunction(block)) {
		throw new Error("Callback needs to be a function");
	}
	if (rest.length === 0) {
		throw new Error("Callback needs a name");
	}
	return block;
}

