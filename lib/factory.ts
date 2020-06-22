import {Adapter} from "./adapters/adapter";
import {Attribute} from "./attribute";
import {Definition} from "./definition";
import {Evaluator} from "./evaluator";
import {FactoryBuilder} from "./factory-builder";
import {NullFactory} from "./null-factory";
import {FactoryOptions, factoryOptionsParser} from "./factory-options-parser";

import {isFunction} from "lodash";

export interface ExtraAttributes {
	traits?: string[];
	attrs?: Record<string, any>;
}

export class Factory extends Definition {
	factoryBuilder: FactoryBuilder;
	model: any;
	parent?: string;

	constructor(
		factoryBuilder: FactoryBuilder,
		name: string,
		model: any,
		rest?: FactoryOptions | Function,
	);

	constructor(
		factoryBuilder: FactoryBuilder,
		name: string,
		model: any,
		options?: FactoryOptions,
		block?: Function,
	);

	constructor(
		factoryBuilder: FactoryBuilder,
		name: string,
		model: any,
		...rest: any[]
	) {
		super(name, factoryBuilder);

		this.model = model;

		const [options, block] = factoryOptionsParser(...rest);

		if (options.aliases) {
			this.aliases = options.aliases;
		}
		if (options.traits) {
			this.baseTraits = options.traits;
		}
		if (options.parent) {
			this.parent = options.parent;
		}

		if (block && isFunction(block)) {
			this.block = block;
		}
	}

	parentFactory(): Factory {
		if (this.parent) {
			return this.factoryBuilder.getFactory(this.parent, false);
		}
		return new NullFactory(this.factoryBuilder) as Factory;
	}

	compile(): void {
		if (!this.compiled) {
			const parentFactory = this.parentFactory();
			parentFactory.compile();
			for (const definedTrait of parentFactory.definedTraits) {
				this.defineTrait(definedTrait);
			}
			super.compile();
			this.compiled = true;
		}
	}

	getParentAttributes(): Attribute[] {
		const attributeNames = this.attributeNames();

		return this.parentFactory()
			.getAttributes()
			.filter((attribute) => !attributeNames.includes(attribute.name));
	}

	getAttributes(): Attribute[] {
		this.compile();

		// Need to generate child attributes before parent attributes
		const definitionAttributes = super.getAttributes();
		const attributesToKeep = this.getParentAttributes();

		return attributesToKeep.concat(definitionAttributes);
	}

	applyAttributes(extraAttributes?: ExtraAttributes): Record<string, any> {
		const {attrs} = mergeDefaults(extraAttributes);

		const attributesToApply = this.getAttributes()
			// This will skip any attribute passed in by the caller
			.filter((attribute) => !Object.prototype.hasOwnProperty.call(attrs, attribute.name));

		const evaluator = new Evaluator(this.name, attributesToApply);

		const instance = evaluator.run();

		for (const [key, value] of Object.entries(attrs)) {
			instance[key] = value;
		}
		return instance;
	}

	async build(adapter: Adapter, extraAttributes?: ExtraAttributes): Promise<any> {
		const modelAttrs = this.applyAttributes(extraAttributes);
		return adapter.build(this.model, modelAttrs);
	}

	async create(adapter: Adapter, extraAttributes?: ExtraAttributes): Promise<any> {
		const instance = await this.build(adapter, extraAttributes);
		return adapter.save(instance, this.model);
	}
}

const defaultAttributes = {traits: [], attrs: {}};

export function mergeDefaults(extraAttributes?: ExtraAttributes):
{
	traits: string[];
	attrs: Record<string, any>;
} {
	return {...defaultAttributes, ...extraAttributes};
}
