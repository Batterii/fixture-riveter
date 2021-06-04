// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Evaluator} from "./evaluator";
import {FixtureRiveter} from "./fixture-riveter";

export type Callback<T> = (instance: T, evaluator: T & Evaluator) => void | Promise<void>;

export class Hook<T> {
	fixtureRiveter: FixtureRiveter;
	name: string;
	callback: Callback<T>;

	constructor(fixtureRiveter: FixtureRiveter, name: string, callback: Callback<T>) {
		this.fixtureRiveter = fixtureRiveter;
		this.name = name;
		this.callback = callback;
	}

	async run(instance: T, evaluator: Evaluator): Promise<any> {
		return this.callback.call(this.fixtureRiveter, instance, evaluator);
	}
}
