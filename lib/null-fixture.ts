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
