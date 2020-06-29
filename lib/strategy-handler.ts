import {FactoryBuilder} from "./factory-builder";
import {Strategy} from "./strategies/strategy";
import {AttributesForStrategy} from "./strategies/attributes-for-strategy";
import {BuildStrategy} from "./strategies/build-strategy";
import {CreateStrategy} from "./strategies/create-strategy";
import {NullStrategy} from "./strategies/null-strategy";

export class StrategyHandler {
	factoryBuilder: FactoryBuilder;
	strategies: Record<string, Strategy>;

	constructor(factoryBuilder: FactoryBuilder) {
		this.factoryBuilder = factoryBuilder;
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
		this.factoryBuilder[strategyName] = async(name: string, ...traits: any[]) => {
			return this.factoryBuilder.run(name, strategyName, traits);
		};
	}

	defineListStrategyMethod(strategyName: string): void {
		this.factoryBuilder[`${strategyName}List`] = async(
			name: string,
			count: number,
			...traits: any[]
		) => {
			return this.factoryBuilder.generateList(name, strategyName, count, traits);
		};
	}

	definePairStrategyMethod(strategyName: string): void {
		this.factoryBuilder[`${strategyName}Pair`] = async(
			name: string,
			...traits: any[]
		) => {
			return this.factoryBuilder.generateList(name, strategyName, 2, traits);
		};
	}
}
