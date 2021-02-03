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

	constructor(
		fixtureRiveter: FixtureRiveter,
		name: string,
		model: ModelConstructor<T>,
		evaluator: Evaluator,
	) {
		this.fixtureRiveter = fixtureRiveter;
		this.name = name;
		this.model = model;
		this.evaluator = evaluator;
		this.attributes = evaluator.attributes;
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

		// Remove all relations
		return this.getAttributeNamesToAssign()
			.filter((a) => !relationNames.includes(a));
	}

	attributesForInstance(): string[] {
		// To do: Need to implement other checks here too
		return this.getAttributeNamesToAssign();
	}

	async toObject(): Promise<Record<string, any>> {
		const instance = {};
		for (const name of this.attributesForObject()) {
			const attribute = await this._get(name);
			instance[name] = attribute;
		}

		return instance;
	}

	async toInstance(): Promise<T> {
		const adapter = this.fixtureRiveter.getAdapter(this.name);
		const instance = adapter.build<T>(this.model);
		const relationNames = this.relationNames();
		const attributeNames = this.attributesForInstance();

		for (const name of attributeNames) {
			const attribute = await this._get(name);
			if (relationNames.includes(name)) {
				await adapter.relate(instance, name, attribute, this.model);
			} else {
				adapter.set(instance, name, attribute);
			}
		}

		return instance;
	}

	private async _get(name: string): Promise<any> {
		return this.evaluator.attr(name);
	}
}
