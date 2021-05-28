import {Attribute} from "./attributes/attribute";
import {extractOverrides, FixtureRiveter} from "./fixture-riveter";
import {Strategy} from "./strategies/strategy";
import {omit} from "lodash";
import {Pojo} from "./types";

export class Evaluator {
	attributeFns: Map<string, (e: Evaluator) => any>;
	attributes: Attribute[];
	buildStrategy: Strategy;
	cachedValues: Map<string, any>;
	fixtureRiveter: FixtureRiveter;
	overrides: Record<string, any>;

	fetchedAttributes: Set<string>;
	instance: any;

	constructor(
		fixtureRiveter: FixtureRiveter,
		buildStrategy: Strategy,
		attributes: Attribute[],
		overrides: Record<string, any>,
	) {
		this.fixtureRiveter = fixtureRiveter;
		this.buildStrategy = buildStrategy;
		this.attributes = attributes;
		this.cachedValues = new Map();
		for (const [key, val] of Object.entries(overrides)) {
			this.cachedValues.set(key, val);
		}
		this.overrides = overrides;
		this.attributeFns = new Map();
		this.fetchedAttributes = new Set();

		this.defineAttributes(attributes);
	}

	defineAttributes(givenAttributes: Attribute[]): void {
		for (const attribute of givenAttributes.reverse()) {
			const {name} = attribute;
			if (!this.attributeFns.has(name)) {
				this.attributeFns.set(name, attribute.evaluate());
			}
		}
	}

	async methodMissing(name: string): Promise<any> {
		return this.attr(name);
	}

	async attr(name: string): Promise<any> {
		if (!this.cachedValues.has(name)) {
			if (this.attributeFns.has(name)) {
				const block = this.attributeFns.get(name)!;
				const value = await block(this);
				this.cachedValues.set(name, value);
			}
		}
		this.fetchedAttributes.add(name);
		return this.cachedValues.get(name);
	}

	async relation<R = Pojo>(
		name: string,
		traits: string[],
		overrides?: Partial<R & {strategy: string}>,
	): Promise<R>;

	async relation<R = Pojo>(
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
		let strategyOverride: Strategy;
		if (StrategyRiveter) {
			strategyOverride = new StrategyRiveter(
				strategyName,
				this.fixtureRiveter,
				this.buildStrategy.adapter,
			);
		} else {
			throw new Error(`Strategy ${strategyName} hasn't been defined`);
		}

		traitOrOverrides.push(omit(overrides, "strategy"));

		return strategyOverride.relation(fixtureName, traitOrOverrides);
	}
}
