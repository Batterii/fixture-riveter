import {Attribute} from "./attributes/attribute";
import {Evaluator} from "./evaluator";
import {FactoryBuilder} from "./factory-builder";

export class AttributeAssigner {
	factoryBuilder: FactoryBuilder;
	model: any;
	evaluator: Evaluator;
	attributes: Attribute[];
	attributeNamesToAssign: string[];

	constructor(factoryBuilder: FactoryBuilder, model: any, evaluator: Evaluator) {
		this.factoryBuilder = factoryBuilder;
		this.model = model;
		this.evaluator = evaluator;
		this.attributes = evaluator.attributes;
	}

	getAttributeNamesToAssign(): any[] {
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

	attributesForObject(): any[] {
		const associationNames = this.associationNames();

		// Remove all associations
		return this.getAttributeNamesToAssign()
			.filter((a) => !associationNames.includes(a));
	}

	attributesForInstance(): any[] {
		// To do: Need to implement other checks here too
		return this.getAttributeNamesToAssign();
	}

	async get(name: string): Promise<any> {
		return this.evaluator.attr(name);
	}

	async toObject(): Promise<Record<string, any>> {
		const instance = {};
		for (const name of this.attributesForObject()) {
			// eslint-disable-next-line no-await-in-loop
			const attribute = await this.get(name);
			instance[name] = attribute;
		}

		return instance;
	}

	async toInstance(): Promise<Record<string, any>> {
		const adapter = this.factoryBuilder.getAdapter();
		const instance = adapter.build(this.model);
		const associationNames = this.associationNames();
		const attributeNames = this.attributesForInstance();

		for (const name of attributeNames) {
			// eslint-disable-next-line no-await-in-loop
			const attribute = await this.get(name);
			if (associationNames.includes(name)) {
				// eslint-disable-next-line no-await-in-loop
				await adapter.associate(instance, name, attribute);
			} else {
				adapter.set(instance, name, attribute);
			}
		}

		return instance;
	}
}
