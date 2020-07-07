import {Attribute} from "./attributes/attribute";
import {Callback} from "./callback";
import {Definition} from "./definition";
import {FixtureRiveter} from "./fixture-riveter";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
export class NullFixture extends Definition {
	model: any;

	constructor(fixtureRiveter: FixtureRiveter) {
		super("nullFixture", fixtureRiveter);
	}

	compile(): void { }

	getAttributes(): Attribute[] {
		return [];
	}

	getCallbacks(): Callback[] {
		return [];
	}
}
