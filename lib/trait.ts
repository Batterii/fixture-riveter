import {Definition} from "./definition";
import {DefinitionProxy} from "./definition-proxy";
import {FixtureRiveter} from "./fixture-riveter";
import {blockFunction} from "./fixture-options-parser";

/* eslint-disable class-methods-use-this */
export class Trait extends Definition {
	constructor(
		name: string,
		fixtureRiveter: FixtureRiveter,
		block?: blockFunction,
	) {
		super(name, fixtureRiveter);

		if (block) {
			this.block = block;
		}

		const proxy = new DefinitionProxy(this);
		proxy.execute();
	}
}
