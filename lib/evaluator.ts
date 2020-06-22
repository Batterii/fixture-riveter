import {Attribute} from "./attribute";

export class Evaluator {
	name: string;
	attributes: Record<string, Function>;
	cachedValues: Record<string, any>;

	constructor(name: string, attributes: Attribute[]) {
		this.name = name;
		this.cachedValues = [];
		this.attributes = Evaluator.defineAttributes(attributes);
	}

	static defineAttributes(givenAttributes: Attribute[]): Record<string, Function> {
		const attributes: Record<string, Function> = {};

		for (const attribute of givenAttributes) {
			const {name} = attribute;
			if (!Object.prototype.hasOwnProperty.call(attributes, name)) {
				attributes[name] = attribute.build();
			}
		}
		return attributes;
	}

	attr(name: string): any {
		if (!Object.prototype.hasOwnProperty.call(this.cachedValues, name)) {
			const fn = this.attributes[name];
			this.cachedValues[name] = fn(this);
		}
		return this.cachedValues[name];
	}

	run(): Record<string, any> {
		const instance: Record<string, any> = {};

		for (const name of Object.keys(this.attributes)) {
			instance[name] = this.attr(name);
		}

		return instance;
	}
}
