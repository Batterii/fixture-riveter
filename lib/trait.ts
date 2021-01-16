import {Attribute} from "./attributes/attribute";
import {Definition} from "./definition";
import {DefinitionProxy} from "./definition-proxy";
import {FixtureRiveter} from "./fixture-riveter";
import {blockFunction} from "./fixture-options-parser";

/* eslint-disable class-methods-use-this */
export class Trait<T> extends Definition<T> {
	fixture: any;

	constructor(
		name: string,
		fixtureRiveter: FixtureRiveter,
		block?: blockFunction<T>,
	) {
		super(name, fixtureRiveter);

		this.block = block;

		const proxy = new DefinitionProxy(this);
		proxy.execute();

		if (proxy.childFixtures.length > 0) {
			const [fixture] = proxy.childFixtures;
			throw new Error(`Can't define a fixture (${fixture.name}) inside trait (${this.name})`);
		}
	}

	defineTrait(newTrait: Trait<T>): void {
		throw new Error(`Can't define nested traits: ${newTrait.name} inside ${this.name}`);
	}

	traitByName(name: string): Trait<T> {
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
