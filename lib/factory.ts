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
}

export class Factory {
	name: string;
	model: any;
	aliases: string[];
	traits: any[];
	block: Function;
	attributes: Attribute[];
	compiled: boolean;
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
		this.attributes = [];
		this.compiled = false;
		this.sequenceHandler = new SequenceHandler();

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
			this.block(this);
			this.compiled = true;
		}
	}

	names(): string[] {
		return [this.name, ...this.aliases];
	}

	defineAttribute(name: string, block: Function): void {
		this.attributes.push(new Attribute(name, block));
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

	sequence(
		name: string,
		initial?: string | number,
		options?: {aliases: string[]},
		callback?: Function,
	): void;

	sequence(name: string, ...rest: any[]): void {
		const newSequence = this.sequenceHandler.registerSequence(name, ...rest);
		this.defineAttribute(name, () => newSequence.next());
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
