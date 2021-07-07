// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {
	Callback,
	Hook,
} from "./hook";
import {FixtureRiveter} from "./fixture-riveter";

import {isFunction} from "lodash";

export class CallbackHandler {
	fixtureRiveter: FixtureRiveter;
	hooks: Hook<any>[];

	constructor(fixtureRiveter: FixtureRiveter) {
		this.fixtureRiveter = fixtureRiveter;
		this.hooks = [];
	}

	registerHook<T>(names: string[], callback: Callback<T>): void {
		for (const name of names) {
			this.hooks.push(new Hook(this.fixtureRiveter, name, callback));
		}
	}

	before<T>(...rest: any[]): void {
		const callback = extractCallback<T>(rest);
		const names = rest.map((n: string) => {
			const string = n.charAt(0).toUpperCase() + n.slice(1);
			return `before${string}`;
		});
		this.registerHook(names, callback);
	}

	after<T>(...rest: any[]): void {
		const callback = extractCallback<T>(rest);
		const names = rest.map((n: string) => {
			const string = n.charAt(0).toUpperCase() + n.slice(1);
			return `after${string}`;
		});
		this.registerHook(names, callback);
	}
}

export function extractCallback<T>(rest: any[]): Callback<T> {
	const callback = rest.pop();
	if (!isFunction(callback)) {
		throw new Error("Callback needs to be a function");
	}
	if (rest.length === 0) {
		throw new Error("Callback needs a name");
	}
	return callback;
}

