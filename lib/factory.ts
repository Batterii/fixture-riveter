import {Adapter} from './adapters/adapter';
import {Attribute} from './attribute';
import {Definition} from './definition';
import {FactoryBuilder} from './factory-builder';
import {NullFactory} from './null-factory';
import {SequenceHandler} from './sequence-handler';
import {factoryOptionsParser, FactoryOptions} from './factory-options-parser';

import {isFunction} from 'lodash';

export interface ExtraAttributes {
	traits?: string[];
	attrs?: Record<string, any>;
}

export class Factory implements Definition {
	factoryBuilder: FactoryBuilder;
	name: string;
	model: any;
	aliases: string[];
	traits: any[];
	parent?: string;
	block: Function;
	attributes: Attribute[];
	sequenceHandler: SequenceHandler;

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
		this.factoryBuilder = factoryBuilder;
		this.name = name;
		this.model = model;
		this.aliases = [];
		this.traits = [];
		this.attributes = [];
		this.sequenceHandler = new SequenceHandler();

		const [options, block] = factoryOptionsParser(...rest);

		if (options.aliases) {
			this.aliases = options.aliases;
		}
		if (options.traits) {
			this.traits = options.traits;
		}
		if (options.parent) {
			this.parent = options.parent;
		}

		if (block && isFunction(block)) {
			this.block = block;
		}
	}

	names(): string[] {
		return [this.name, ...this.aliases];
	}

	parentFactory(): Factory {
		if (this.parent) {
			return this.factoryBuilder.getFactory(this.parent, false);
		}
		return new NullFactory(this.factoryBuilder, this.model);
	}

	defineAttribute(name: string, block: Function): void {
		this.attributes.push(new Attribute(name, block));
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
		const attributesToKeep = this.getParentAttributes();
		return attributesToKeep.concat(this.attributes);
	}

	applyAttributes(extraAttributes?: ExtraAttributes): Record<string, any> {
		const {attrs} = mergeDefaults(extraAttributes);
		const attributesToApply = this.getAttributes();
		const instance = {};

		for (const {name, block} of attributesToApply) {
			if (!Object.prototype.hasOwnProperty.call(attrs, name)) {
				instance[name] = block.call(this, this);
			}
		}
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
