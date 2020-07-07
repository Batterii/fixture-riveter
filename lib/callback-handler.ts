import {
	callbackFunction,
	Callback,
} from "./callback";
import {FixtureRiveter} from "./fixture-riveter";

import {isFunction} from "lodash";

export class CallbackHandler {
	callbacks: Callback[];
	fixtureRiveter: FixtureRiveter;

	constructor(fixtureRiveter: FixtureRiveter) {
		this.callbacks = [];
		this.fixtureRiveter = fixtureRiveter;
	}

	addCallback(names: string[], block: callbackFunction): void {
		for (const name of names) {
			this.callbacks.push(new Callback(this.fixtureRiveter, name, block));
		}
	}

	before(...rest: any[]): void {
		const block = extractCallbackFunction(rest);
		const names = rest.map((n: string) => {
			const string = n.charAt(0).toUpperCase() + n.slice(1);
			return `before${string}`;
		});
		this.addCallback(names, block);
	}

	after(...rest: any[]): void {
		const block = extractCallbackFunction(rest);
		const names = rest.map((n: string) => {
			const string = n.charAt(0).toUpperCase() + n.slice(1);
			return `after${string}`;
		});
		this.addCallback(names, block);
	}
}

export function extractCallbackFunction(rest: any[]): any {
	const block = rest.pop();
	if (!isFunction(block)) {
		throw new Error("Callback needs to be a function");
	}
	if (rest.length === 0) {
		throw new Error("Calback needs a name");
	}
	return block;
}

