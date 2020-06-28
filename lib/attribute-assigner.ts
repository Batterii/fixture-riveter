import {Attribute} from "./attribute";
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

			// To do: use this when implementing transients
			// const ignoredNames = this.attributes.map((a) => a.isIgnored());
			// this.attributeNamesToAssign = attributeNames.concat(overrideNames)
			// 	.filter((name) => !ignoredNames.includes(name));

			this.attributeNamesToAssign = attributeNames.concat(overrideNames);
		}
		return this.attributeNamesToAssign;
	}

	attributesForObject(): any[] {
		const associationNames = this.attributes
			.filter((a) => a.isAssociation)
			.map((a) => a.name);

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

		for (const name of this.attributesForInstance()) {
			// eslint-disable-next-line no-await-in-loop
			const attribute = await this.get(name);
			adapter.set(instance, name, attribute);
		}

		return instance;
	}
}
