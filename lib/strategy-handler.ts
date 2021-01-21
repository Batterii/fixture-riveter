import {FixtureRiveter, FixtureName} from "./fixture-riveter";
import {Strategy} from "./strategies/strategy";
import {AttributesForStrategy} from "./strategies/attributes-for-strategy";
import {BuildStrategy} from "./strategies/build-strategy";
import {CreateStrategy} from "./strategies/create-strategy";
import {NullStrategy} from "./strategies/null-strategy";

export class StrategyHandler {
	fixtureRiveter: FixtureRiveter;
	strategies: Record<string, Strategy>;

	constructor(fixtureRiveter: FixtureRiveter) {
		this.fixtureRiveter = fixtureRiveter;
		this.strategies = {};
	}

	registerStrategy(strategyName: string, strategyClass: any): void {
		this.strategies[strategyName] = strategyClass;
		this.defineStrategyMethods(strategyName);
	}

	getStrategy(strategyName: string): any {
		return this.strategies[strategyName];
	}

	registerDefaultStategies(): void {
		this.registerStrategy("attributesFor", AttributesForStrategy);
		this.registerStrategy("build", BuildStrategy);
		this.registerStrategy("create", CreateStrategy);
		this.registerStrategy("null", NullStrategy);
	}

	defineStrategyMethods(strategyName: string): void {
		this.defineSingularStrategyMethod(strategyName);
		this.defineListStrategyMethod(strategyName);
		this.definePairStrategyMethod(strategyName);
	}

	defineSingularStrategyMethod(strategyName: string): void {
		this.fixtureRiveter[strategyName] = async(name: FixtureName, ...traits: any[]) => {
			return this.fixtureRiveter.run(name, strategyName, traits);
		};
	}

	defineListStrategyMethod(strategyName: string): void {
		this.fixtureRiveter[`${strategyName}List`] = async(
			name: FixtureName,
			count: number,
			...traits: any[]
		) => {
			return this.fixtureRiveter.runList(name, strategyName, count, traits);
		};
	}

	definePairStrategyMethod(strategyName: string): void {
		this.fixtureRiveter[`${strategyName}Pair`] = async(
			name: FixtureName,
			...traits: any[]
		) => {
			return this.fixtureRiveter.runList(name, strategyName, 2, traits);
		};
	}
}
