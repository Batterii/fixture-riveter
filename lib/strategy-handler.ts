// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {FixtureRiveter} from "./fixture-riveter";
import {Strategy} from "./strategies/strategy";
import {AttributesForStrategy} from "./strategies/attributes-for-strategy";
import {BuildStrategy} from "./strategies/build-strategy";
import {CreateStrategy} from "./strategies/create-strategy";
import {FixtureName} from "./types";

export class StrategyHandler {
	fixtureRiveter: FixtureRiveter;
	strategies: Map<string, typeof Strategy>;

	constructor(fixtureRiveter: FixtureRiveter) {
		this.fixtureRiveter = fixtureRiveter;
		this.strategies = new Map();
	}

	registerStrategy(strategyName: string, strategyClass: typeof Strategy): void {
		this.strategies.set(strategyName, strategyClass);
		this.defineStrategyMethods(strategyName);
	}

	getStrategy(strategyName: string): typeof Strategy {
		const strategy = this.strategies.get(strategyName);
		if (strategy === undefined) {
			throw new Error(`Strategy ${strategyName} hasn't been defined`);
		}
		return strategy;
	}

	registerDefaultStategies(): void {
		this.registerStrategy("attributesFor", AttributesForStrategy);
		this.registerStrategy("build", BuildStrategy);
		this.registerStrategy("create", CreateStrategy);
	}

	defineStrategyMethods(strategyName: string): void {
		this.defineSingularStrategyMethod(strategyName);
		this.defineListStrategyMethod(strategyName);
		this.definePairStrategyMethod(strategyName);
	}

	defineSingularStrategyMethod(strategyName: string): void {
		this.fixtureRiveter[strategyName] = async(name: FixtureName<any>, ...traits: any[]) => {
			return this.fixtureRiveter.run(name, strategyName, ...traits);
		};
	}

	defineListStrategyMethod(strategyName: string): void {
		this.fixtureRiveter[`${strategyName}List`] = async(
			name: FixtureName<any>,
			count: number,
			...traits: any[]
		) => {
			return this.fixtureRiveter.runList(name, strategyName, count, ...traits);
		};
	}

	definePairStrategyMethod(strategyName: string): void {
		this.fixtureRiveter[`${strategyName}Pair`] = async(
			name: FixtureName<any>,
			...traits: any[]
		) => {
			return this.fixtureRiveter.runList(name, strategyName, 2, ...traits);
		};
	}
}
