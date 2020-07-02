import {Attribute} from "./attributes/attribute";
import {
	extractAttributes,
	FactoryBuilder,
} from "./factory-builder";
import {Strategy} from "./strategies/strategy";

import {omit} from "lodash";

type AttributeFuncs = Record<string, (e: Evaluator) => any>;

export class Evaluator {
	attributeFns: AttributeFuncs;
	attributes: Attribute[];
	buildStrategy: Strategy;
	cachedValues: Record<string, any>;
	factoryBuilder: FactoryBuilder;
	overrides: Record<string, any>;

	constructor(
		factoryBuilder: FactoryBuilder,
		buildStrategy: Strategy,
		attributes: Attribute[],
		overrides: Record<string, any>,
	) {
		this.factoryBuilder = factoryBuilder;
		this.buildStrategy = buildStrategy;
		this.attributes = attributes;
		this.cachedValues = overrides;
		this.overrides = overrides;
		this.attributeFns = {};

		this.defineAttributes(attributes);
	}

	defineAttributes(givenAttributes: Attribute[]): void {
		for (const attribute of givenAttributes.reverse()) {
			const {name} = attribute;
			if (!Object.prototype.hasOwnProperty.call(this.attributeFns, name)) {
				this.attributeFns[name] = attribute.evaluate(this);
			}
		}
	}

	async attr(name: string): Promise<any> {
		if (!Object.prototype.hasOwnProperty.call(this.cachedValues, name)) {
			const fn = this.attributeFns[name];
			this.cachedValues[name] = await fn(this);
		}
		return this.cachedValues[name];
	}

	async association(
		factoryName: string,
		...traitsAndOverrides: any[]
	): Promise<Record<string, any>> {
		const overrides = extractAttributes(traitsAndOverrides);

		let strategyName: string;
		if (overrides.strategy) {
			strategyName = overrides.strategy;
		} else if (this.factoryBuilder.useParentStrategy) {
			strategyName = this.buildStrategy.name;
		} else {
			strategyName = "create";
		}

		const StrategyBuilder = this.factoryBuilder.strategyHandler.getStrategy(strategyName);
		const strategyOverride = new StrategyBuilder(
			strategyName,
			this.factoryBuilder,
			this.buildStrategy.adapter,
		);

		traitsAndOverrides.push(omit(overrides, "strategy"));

		return strategyOverride.association(factoryName, traitsAndOverrides);
	}
}
