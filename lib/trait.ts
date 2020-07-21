import {Attribute} from "./attributes/attribute";
import {Definition} from "./definition";
import {DefinitionProxy} from "./definition-proxy";
import {FixtureRiveter} from "./fixture-riveter";
import {blockFunction} from "./fixture-options-parser";

/* eslint-disable class-methods-use-this */
export class Trait extends Definition {
	fixture: any;

	constructor(
		name: string,
		fixtureRiveter: FixtureRiveter,
		block?: blockFunction,
	) {
		super(name, fixtureRiveter);

		this.block = block;

		const proxy = new DefinitionProxy(this);
		proxy.execute();

		if (proxy.childFactories.length > 0) {
			const [factory] = proxy.childFactories;
			throw new Error(`Can't define a factory (${factory.name}) inside trait (${this.name})`);
		}
	}

	defineTrait(newTrait: Trait): void {
		throw new Error(`Can't define nested traits: ${newTrait.name} inside ${this.name}`);
	}

	traitByName(name: string): Trait {
		if (this.fixture) {
			return this.fixture.traitByName(name);
		}
		return this.fixtureRiveter.getTrait(name);
	}

	getAttributes(): Attribute[] {
		return this.aggregateFromTraitsAndSelf(
			"getAttributes",
			() => this.declarationHandler.getAttributes(),
		);
	}
}
