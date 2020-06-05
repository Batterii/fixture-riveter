import {Adapter} from './adapters/adapter';
import {isFunction, first, last} from 'lodash';

export interface ExtraAttributes {
	traits?: string[];
	attrs?: Record<string, any>;
}

export interface Options {
	aliases?: string[];
	traits?: string[];
}

export class Factory {
	name: string;
	model: any;
	aliases: string[];
	traits: any[];
	block: Function;
	attributes: Record<string, any>;
	compiled: boolean;

	constructor(name: string, model: any, rest?: Options | Function);
	constructor(
		name: string,
		model: any,
		...rest: any[]
	) {
		this.name = name;
		this.model = model;
		this.aliases = [];
		this.traits = [];
		this.attributes = {};
		this.compiled = false;

		const options = first(rest);
		const block = last(rest);

		if (options && options.aliases) {
			this.aliases = options.aliases;
		}
		if (options && options.traits) {
			this.traits = options.traits;
		}

		if (block && isFunction(block)) {
			this.block = block;
		}
	}

	compile(): void {
		if (this.block && !this.compiled) {
			this.block();
			this.compiled = true;
		}
	}

	names(): string[] {
		return [this.name, ...this.aliases];
	}

	defineAttribute(attrName: string, block: Function): void {
		this.attributes[attrName] = block;
	}

	attr(attrName: string, block?: Function): void {
		if (block && isFunction(block)) {
			this.defineAttribute(attrName, block);
		} else {
			throw new Error(`wrong options, bruh: ${attrName}, ${block}`);
		}
	}

	applyAttributes(extraAttributes?: ExtraAttributes): any {
		const {attrs} = mergeDefaults(extraAttributes);
		const instance = {};

		// eslint-disable-next-line no-warning-comments
		// TODO: implement trait handling
		// traits.filter((trait: string) => this.traits.includes(trait));

		for (const [attrName, block] of Object.entries(this.attributes)) {
			instance[attrName] = block.call(this);
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
