import {Adapter} from './adapters/adapter';
import {Attribute} from './attribute';
import {SequenceHandler} from './sequence-handler';

import {isFunction, first, last} from 'lodash';

export interface ExtraAttributes {
	traits?: string[];
	attrs?: Record<string, any>;
}

export interface FactoryOptions {
	aliases?: string[];
	traits?: string[];
	parent?: string;
}
export function factoryOptionsParser(
	option?: FactoryOptions | Function,
): [Record<string, any>, Function | undefined];
export function factoryOptionsParser(
	objOption: FactoryOptions,
	fnOption: Function,
): [Record<string, any>, Function | undefined];
export function factoryOptionsParser(
	...rest: any[]
): [Record<string, any>, Function | undefined] {
	let options = first(rest);
	if (!options) {
		options = {};
	}

	let block = last(rest);
	if (!isFunction(block)) {
		block = undefined;
	}

	return [options, block];
}

export class Factory {
	name: string;
	model: any;
	aliases: string[];
	traits: any[];
	parent: string;
	block: Function;
	attributes: Attribute[];
	sequenceHandler: SequenceHandler;

	constructor(name: string, model: any, rest?: FactoryOptions | Function);
	constructor(
		name: string,
		model: any,
		...rest: any[]
	) {
		this.name = name;
		this.model = model;
		this.aliases = [];
		this.traits = [];
		this.parent = '';
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

	defineAttribute(name: string, block: Function): void {
		this.attributes.push(new Attribute(name, block));
	}

	applyAttributes(extraAttributes?: ExtraAttributes): any {
		const {attrs} = mergeDefaults(extraAttributes);
		const instance = {};

		// eslint-disable-next-line no-warning-comments
		// TODO: implement trait handling
		// traits.filter((trait: string) => this.traits.includes(trait));

		for (const {name, block} of this.attributes) {
			instance[name] = block.call(this, this);
		}
		return {...instance, ...attrs};
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
