import {Attribute} from "./attributes/attribute";
import {
	extractOverrides,
	FixtureRiveter,
} from "./fixture-riveter";
import {Strategy} from "./strategies/strategy";
import {omit} from "lodash";
import {Pojo} from "./types";

export class Evaluator {
	attributeFns: Record<string, (e: Evaluator) => any>;
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

	async methodMissing(name: string): Promise<any> {
		return this.attr(name);
	}

	async attr(name: string): Promise<any> {
		if (!Object.prototype.hasOwnProperty.call(this.cachedValues, name)) {
			const fn = this.attributeFns[name];
			this.cachedValues[name] = await fn(this);
		}
		return this.cachedValues[name];
	}

	association<R = any>(
		name: string,
		traits: string[],
		overrides?: Partial<R extends any ? Pojo : R & {strategy: string}>,
	): Promise<R extends any ? Pojo : R>;

	association<R = any>(
		name: string,
		traitOrOverrides?: (
			| string[]
			| Partial<R extends any ? Pojo : R & {strategy: string}>
		),
	): Promise<R extends any ? Pojo : R>;

	async association<R = any>(
		fixtureName: string,
		...traitOrOverrides: any[]
	): Promise<R extends any ? Pojo : R> {
		const overrides = extractOverrides(traitOrOverrides);

		let strategyName = "create";
		if (overrides.strategy) {
			strategyName = overrides.strategy;
		} else if (this.fixtureRiveter.useParentStrategy) {
			strategyName = this.buildStrategy.name;
		}

		const StrategyRiveter = this.fixtureRiveter.strategyHandler.getStrategy(strategyName);
		const strategyOverride = new StrategyRiveter(
			strategyName,
			this.fixtureRiveter,
			this.buildStrategy.adapter,
		);

		traitOrOverrides.push(omit(overrides, "strategy"));

		return strategyOverride.association(fixtureName, traitOrOverrides);
	}
}
