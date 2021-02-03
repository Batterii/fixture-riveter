import {Attribute} from "./attributes/attribute";
import {Definition} from "./definition";
import {DefinitionProxy} from "./definition-proxy";
import {Fixture} from "./fixture";
import {FixtureRiveter} from "./fixture-riveter";
import {BlockFunction} from "./types";

/* eslint-disable class-methods-use-this */
export class Trait<T> extends Definition<T> {
	fixture: Fixture<T>;

	constructor(
		name: string,
		fixtureRiveter: FixtureRiveter,
		block?: BlockFunction<T>,
	) {
		super(name, fixtureRiveter);

		this.block = block;

		const proxy = new DefinitionProxy(this);
		proxy.execute();

		if (proxy.childFixtures.length > 0) {
			const [fixtureTuple] = proxy.childFixtures;
			if (fixtureTuple) {
				throw new Error(
					`Can't define a fixture (${fixtureTuple[0] || ""}) inside trait (${this.name})`,
				);
			}
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
		this.compile();

		return [
			this.getBaseTraits().map((t) => t.getAttributes()),
			this.declarationHandler.getAttributes(),
			this.getAdditionalTraits().map((t) => t.getAttributes()),
		].flat(2).filter(Boolean);
	}
}
