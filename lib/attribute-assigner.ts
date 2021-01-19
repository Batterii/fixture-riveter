import {Attribute} from "./attributes/attribute";
import {Evaluator} from "./evaluator";
import {FixtureRiveter, ModelConstructor} from "./fixture-riveter";

export class AttributeAssigner<T> {
	fixtureRiveter: FixtureRiveter;
	name: string;
	model: ModelConstructor<T>;
	evaluator: Evaluator;
	attributes: Attribute[];
	attributeNamesToAssign: string[];

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

	associationNames(): string[] {
		return this.attributes
			.filter((a) => a.isAssociation)
			.map((a) => a.name);
	}

	attributesForObject(): string[] {
		const associationNames = this.associationNames();

		// Remove all associations
		return this.getAttributeNamesToAssign()
			.filter((a) => !associationNames.includes(a));
	}

	attributesForInstance(): string[] {
		// To do: Need to implement other checks here too
		return this.getAttributeNamesToAssign();
	}

	async toObject(): Promise<Record<string, any>> {
		const instance = {};
		for (const name of this.attributesForObject()) {
			// eslint-disable-next-line no-await-in-loop
			const attribute = await this._get(name);
			instance[name] = attribute;
		}

		return instance;
	}

	async toInstance(): Promise<T> {
		const adapter = this.fixtureRiveter.getAdapter(this.name);
		const instance = adapter.build<T>(this.model);
		const associationNames = this.associationNames();
		const attributeNames = this.attributesForInstance();

		for (const name of attributeNames) {
			// eslint-disable-next-line no-await-in-loop
			const attribute = await this._get(name);
			if (associationNames.includes(name)) {
				// eslint-disable-next-line no-await-in-loop
				await adapter.associate(instance, name, attribute);
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
