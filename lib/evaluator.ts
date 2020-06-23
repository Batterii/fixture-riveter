import {Attribute} from "./attribute";
import {
	extractAttributes,
	FactoryBuilder,
} from "./factory-builder";

import {omit, zip} from "lodash";

type AttributeFuncs = Record<string, (e: Evaluator) => any>;

export class Evaluator {
	factoryBuilder: FactoryBuilder;
	buildStrategy: string;
	attributes: AttributeFuncs;
	cachedValues: Record<string, any>;

	constructor(factoryBuilder: FactoryBuilder, buildStrategy: string, attributes: Attribute[]) {
		this.factoryBuilder = factoryBuilder;
		this.buildStrategy = buildStrategy;
		this.cachedValues = [];
		this.attributes = this.defineAttributes(attributes);
	}

	defineAttributes(givenAttributes: Attribute[]): AttributeFuncs {
		const attributes: AttributeFuncs = {};

		for (const attribute of givenAttributes.reverse()) {
			const {name} = attribute;
			if (!Object.prototype.hasOwnProperty.call(attributes, name)) {
				attributes[name] = attribute.evaluate(this);
			}
		}
		return attributes;
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
		const strategy = overrides.strategy || this.buildStrategy;

		traitsAndOverrides.push(omit(overrides, "strategy"));

		return this.factoryBuilder.run(factoryName, strategy, traitsAndOverrides);
	}
}
