// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Definition} from "./definition";
import {DefinitionProxy} from "./definition-proxy";
import {Fixture} from "./fixture";
import {FixtureRiveter} from "./fixture-riveter";
import {BlockFunction} from "./types";

/* eslint-disable class-methods-use-this */
export class Trait<T> extends Definition<T> {
	fixture?: Fixture<T>;

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
			throw new Error(
				`Can't define a fixture (${fixtureTuple[0]}) inside trait (${this.name})`,
			);
		}
	}

	defineTrait(newTrait: Trait<T>): void {
		throw new Error(`Can't define nested traits: ${newTrait.name} inside ${this.name}`);
	}

	setFixture(fixture: Fixture<T>): void {
		this.fixture = fixture;
	}

	traitByName(name: string): Trait<T> {
		if (this.fixture) {
			return this.fixture.traitByName(name);
		}
		return this.fixtureRiveter.getTrait(name);
	}
}
