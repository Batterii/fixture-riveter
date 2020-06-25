import {Attribute} from "./attribute";
import {
	extractAttributes,
	FactoryBuilder,
	strategyCalculator,
} from "./factory-builder";
import {Strategy} from "./strategies/strategy";

import {omit, zip} from "lodash";

type AttributeFuncs = Record<string, (e: Evaluator) => any>;

export class Evaluator {
	factoryBuilder: FactoryBuilder;
	buildStrategy: Strategy;
	attributes: AttributeFuncs;
	overrides: Record<string, any>;
	cachedValues: Record<string, any>;

	constructor(
		factoryBuilder: FactoryBuilder,
		buildStrategy: Strategy,
		attributes: Attribute[],
		overrides: Record<string, any>,
	) {
		this.factoryBuilder = factoryBuilder;
		this.buildStrategy = buildStrategy;
		this.cachedValues = [];

		this.defineAttributes(attributes);
		this.assignOverrides(overrides);
	}

	defineAttributes(givenAttributes: Attribute[]): void {
		const attributes: AttributeFuncs = {};

		for (const attribute of givenAttributes.reverse()) {
			const {name} = attribute;
			if (!Object.prototype.hasOwnProperty.call(attributes, name)) {
				attributes[name] = attribute.evaluate(this);
			}
		}
		this.attributes = attributes;
	}

	assignOverrides(overrides: Record<string, any>): void {
		for (const [key, value] of Object.entries(overrides)) {
			this.attributes[key] = () => value;
		}
	}

	async attr(name: string): Promise<any> {
		if (!Object.prototype.hasOwnProperty.call(this.cachedValues, name)) {
			const fn = this.attributes[name];
			this.cachedValues[name] = await fn(this);
		}
		return this.cachedValues[name];
	}

	async run(): Promise<Record<string, any>> {
		const names: string[] = [];
		const promises: Promise<any>[] = [];

		for (const name of Object.keys(this.attributes)) {
			names.push(name);
			promises.push(this.attr(name));
		}
		const attributes: any[] = [];
		await Promise.all(promises).then((val) => {
			for (const promise of val) {
				attributes.push(promise);
			}
		});

		const instance: Record<string, any> = {};
		for (const [key, value] of zip(names, attributes)) {
			instance[key as string] = value;
		}
		return instance;
	}

	async association(
		factoryName: string,
		...traitsAndOverrides: any[]
	): Promise<Record<string, any>> {
		const overrides = extractAttributes(traitsAndOverrides);

		let strategyOverride: Strategy;
		if (overrides.strategy) {
			strategyOverride = strategyCalculator(
				this.factoryBuilder,
				overrides.strategy,
				this.buildStrategy.adapter,
			);
		} else if (this.factoryBuilder.useParentStrategy) {
			strategyOverride = this.buildStrategy;
		} else {
			strategyOverride = strategyCalculator(
				this.factoryBuilder,
				"create",
				this.buildStrategy.adapter,
			);
		}

		traitsAndOverrides.push(omit(overrides, "buildStrategy"));

		return strategyOverride.association(factoryName, traitsAndOverrides);
	}
}
