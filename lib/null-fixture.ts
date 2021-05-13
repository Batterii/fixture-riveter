import {AdapterMethodBuilder} from "./adapter-method-builder";
import {Callback} from "./callback";
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

	getCallbacks(): Callback<T>[] {
		return this.fixtureRiveter.getCallbacks();
	}

	adapterMethodsClass(): typeof AdapterMethodBuilder {
		return AdapterMethodBuilder;
	}
}
