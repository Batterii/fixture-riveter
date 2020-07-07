import {Attribute} from "./attributes/attribute";
import {
	extractAttributes,
	FixtureRiveter,
} from "./fixture-riveter";
import {Strategy} from "./strategies/strategy";

import {omit} from "lodash";

type AttributeFuncs = Record<string, (e: Evaluator) => any>;

export class Evaluator {
	attributeFns: AttributeFuncs;
	attributes: Attribute[];
	buildStrategy: Strategy;
	cachedValues: Record<string, any>;
	fixtureRiveter: FixtureRiveter;
	overrides: Record<string, any>;

	constructor(
		fixtureRiveter: FixtureRiveter,
		buildStrategy: Strategy,
		attributes: Attribute[],
		overrides: Record<string, any>,
	) {
		this.fixtureRiveter = fixtureRiveter;
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
		fixtureName: string,
		...traitsAndOverrides: any[]
	): Promise<Record<string, any>> {
		const overrides = extractAttributes(traitsAndOverrides);

		let strategyName: string;
		if (overrides.strategy) {
			strategyName = overrides.strategy;
		} else if (this.fixtureRiveter.useParentStrategy) {
			strategyName = this.buildStrategy.name;
		} else {
			strategyName = "create";
		}

		const StrategyRiveter = this.fixtureRiveter.strategyHandler.getStrategy(strategyName);
		const strategyOverride = new StrategyRiveter(
			strategyName,
			this.fixtureRiveter,
			this.buildStrategy.adapter,
		);

		traitsAndOverrides.push(omit(overrides, "strategy"));

		return strategyOverride.association(fixtureName, traitsAndOverrides);
	}
}
