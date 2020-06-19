import {Adapter} from "./adapters/adapter";
import {Attribute} from "./attribute";
import {Declaration} from "./declaration";
import {DeclarationHandler} from "./declaration-handler";
import {Trait} from "./trait";
import {Definition} from "./definition";
import {FactoryBuilder} from "./factory-builder";
import {NullFactory} from "./null-factory";
import {SequenceHandler} from "./sequence-handler";
import {FactoryOptions, factoryOptionsParser} from "./factory-options-parser";

import {isFunction} from "lodash";

export interface ExtraAttributes {
	traits?: string[];
	attrs?: Record<string, any>;
}

export class Factory extends Definition {
	factoryBuilder: FactoryBuilder;
	model: any;
	traits: Set<Trait>;
	baseTraits: string[];
	traitsCache?: Record<string, Trait>;
	parent?: string;
	block: Function;
	declarationHandler: DeclarationHandler;
	attributes: Attribute[];
	sequenceHandler: SequenceHandler;

	compiled: boolean;

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
		this.baseTraits = [];

		this.compiled = false;

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
		return new NullFactory(this.factoryBuilder, this.model) as Factory;
	}

	declareAttribute(declaration: Declaration): void {
		this.declarationHandler.declareAttribute(declaration);
	}

	defineTrait(trait: Trait): void {
		this.traits.add(trait);
	}

	compile(): void {
		if (!this.compiled) {
			this.attributes = this.declarationHandler.convertToAttributes();
			this.compiled = true;
		}
	}

	attributeNames(): string[] {
		return this.attributes.map((a) => a.name);
	}

	getParentAttributes(): Attribute[] {
		const attributeNames = this.attributeNames();

		return this.parentFactory()
			.getAttributes()
			.filter((attribute: Attribute) => !attributeNames.includes(attribute.name));
	}

	getAttributes(): Attribute[] {
		this.compile();

		const attributesToKeep = this.getParentAttributes();
		return attributesToKeep.concat(this.attributes);
	}

	traitNames(): string[] {
		const traits = Array.from(this.traits.values());
		return traits.map((t: Trait) => t.name);
	}

	getParentTraits(): Trait[] {
		const traitNames = this.traitNames();

		return this.parentFactory()
			.getTraits()
			.filter((trait: Trait) => !traitNames.includes(trait.name));
	}

	getTraits(): Trait[] {
		const traitsToKeep = this.getParentTraits();
		return traitsToKeep.concat(Array.from(this.traits.values()));
	}

	inheritTraits(traits: string[]): void {
		this.baseTraits = this.baseTraits.concat(traits);
	}

	traitByName(name: string): Trait | undefined {
		return this.traitFor(name) || this.factoryBuilder.getTrait(name, false);
	}

	traitFor(name: string): Trait | undefined {
		if (!this.traitsCache) {
			const cache = {};
			this.traits.forEach((trait: Trait) => {
				cache[trait.name] = trait;
			});
			this.traitsCache = cache;
		}

		return this.traitsCache[name];
	}

	getBaseTraits(): Trait[] {
		const traits: Trait[] = [];
		this.baseTraits.forEach((name: string) => {
			const result = this.traitByName(name);
			if (result) {
				traits.push(result);
			}
		});
		return traits;
	}

	applyAttributes(extraAttributes?: ExtraAttributes): Record<string, any> {
		const {attrs} = mergeDefaults(extraAttributes);
		const attributesToApply = this.getAttributes();
		const instance: Record<string, any> = {};

		for (const attribute of attributesToApply) {
			const {name} = attribute;
			if (!Object.prototype.hasOwnProperty.call(attrs, name)) {
				instance[name] = attribute.build().call(this, this);
			}
		}

		// const traitsToApply = this.getTraits();
		// for (const trait of traitsToApply) {
		// 	for (const {name, block} of trait.attributes) {
		// 		if (!Object.prototype.hasOwnProperty.call(attrs, name)) {
		// 			instance[name] = block.call(this, this);
		// 		}
		// 	}
		// }

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
