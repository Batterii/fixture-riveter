// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {AdapterMethodBuilder} from "./adapter-method-builder";
import {Hook} from "./hook";
import {Definition} from "./definition";
import {FixtureRiveter} from "./fixture-riveter";
import {ModelConstructor} from "./types";

/* eslint-disable @typescript-eslint/no-empty-function */
export class NullFixture<T> extends Definition<T> {
	model: ModelConstructor<T>;

	constructor(fixtureRiveter: FixtureRiveter) {
		super("nullFixture", fixtureRiveter);
	}

	compile(): void { }

	getHooks(): Hook<T>[] {
		return this.fixtureRiveter.getHooks();
	}

	adapterMethodsClass(): typeof AdapterMethodBuilder {
		return AdapterMethodBuilder;
	}
}
