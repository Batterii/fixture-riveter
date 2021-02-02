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

	relation<R = Pojo>(
		name: string,
		traits: string[],
		overrides?: Partial<R & {strategy: string}>,
	): Promise<R>;

	relation<R = Pojo>(
		name: string,
		traitOrOverrides?: (
			| string[]
			| Partial<R & {strategy: string}>
		),
	): Promise<R>;

	async relation<R = Pojo>(
		fixtureName: string,
		...traitOrOverrides: any[]
	): Promise<R> {
		const overrides = extractOverrides(traitOrOverrides);

		let strategyName = this.buildStrategy.name;
		if (overrides.strategy) {
			strategyName = overrides.strategy;
		} else if (!this.fixtureRiveter.useParentStrategy) {
			strategyName = "create";
		}

		const StrategyRiveter = this.fixtureRiveter.strategyHandler.getStrategy(strategyName);
		const strategyOverride = new StrategyRiveter(
			strategyName,
			this.fixtureRiveter,
			this.buildStrategy.adapter,
		);

		traitOrOverrides.push(omit(overrides, "strategy"));

		return strategyOverride.relation(fixtureName, traitOrOverrides);
	}
}
