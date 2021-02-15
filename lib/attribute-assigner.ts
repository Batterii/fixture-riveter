import {Adapter} from "./adapters/adapter";
import {Attribute} from "./attributes/attribute";
import {Evaluator} from "./evaluator";
import {FixtureRiveter} from "./fixture-riveter";
import {ModelConstructor} from "./types";

export class AttributeAssigner<T> {
	fixtureRiveter: FixtureRiveter;
	name: string;
	model: ModelConstructor<T>;
	evaluator: Evaluator;
	attributes: Attribute[];
	attributeNamesToAssign?: string[];

	adapter: Adapter;

	constructor(
		fixtureRiveter: FixtureRiveter,
		name: string,
		model: ModelConstructor<T>,
		evaluator: Evaluator,
		adapter: Adapter,
	) {
		this.fixtureRiveter = fixtureRiveter;
		this.name = name;
		this.model = model;
		this.evaluator = evaluator;
		this.attributes = evaluator.attributes;
		this.adapter = adapter;
	}

	getAttributeNamesToAssign(): string[] {
		if (!this.attributeNamesToAssign) {
			const attributeNames = this.attributes.map((a) => a.name);
			const overrideNames = Object.keys(this.evaluator.overrides);

			const ignoredNames = this.attributes
				.filter((a) => a.ignored)
				.map((a) => a.name);

			this.attributeNamesToAssign = attributeNames
				.concat(overrideNames)
				.filter((name) => !ignoredNames.includes(name));
		}
		return this.attributeNamesToAssign;
	}

	relationNames(): string[] {
		return this.attributes
			.filter((a) => a.isRelation)
			.map((a) => a.name);
	}

	attributesForObject(): string[] {
		const relationNames = this.relationNames();
		return this.getAttributeNamesToAssign().filter((a) => !relationNames.includes(a));
	}

	attributesForInstance(): string[] {
		const invokedMethods = Array.from(this.evaluator.fetchedAttributes.keys());
		return this.getAttributeNamesToAssign().filter((a) => !invokedMethods.includes(a));
	}

	async toObject(): Promise<Record<string, any>> {
		const instance = {};
		for (const name of this.attributesForObject()) {
			instance[name] = await this._get(name);
		}

		return instance;
	}

	async toInstance(): Promise<T> {
		const instance = await this.adapter.build<T>(this.model, this.evaluator);
		const relationNames = this.relationNames();
		const attributeNames = this.attributesForInstance();

		for (const name of attributeNames) {
			const attribute = await this._get(name);
			if (relationNames.includes(name)) {
				await this.adapter.relate(instance, name, attribute, this.model);
			} else {
				this.adapter.set(instance, name, attribute);
			}
		}

		return instance;
	}

	private async _get(name: string): Promise<any> {
		return this.evaluator.attr(name);
	}
}
