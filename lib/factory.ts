import {isFunction, first, last} from 'lodash';

interface ExtraAttributes {
	traits?: string[];
	attrs?: any;
}

export class Factory {
	name: string;
	model: any;
	aliases: string[];
	traits: any[];
	block: Function;
	attributes: Record<string, any>;
	compiled: boolean;

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

	async applyAttributes(extraAttributes?: ExtraAttributes): Promise<any> {
		const {attrs} = mergeDefaults(extraAttributes);
		const instance = {};

		// eslint-disable-next-line no-warning-comments
		// TODO: implement trait handling
		// traits.filter((trait: string) => this.traits.includes(trait));

		for (const [attrName, block] of Object.entries(this.attributes)) {
			// eslint-disable-next-line no-await-in-loop
			instance[attrName] = await block.call(this);
		}
		return {...instance, ...attrs};
	}

	async build(adapter: any, extraAttributes?: ExtraAttributes): Promise<any> {
		const modelAttrs = await this.applyAttributes(extraAttributes);
		return adapter.build(this.model, modelAttrs);
	}
}

const defaultAttributes = {traits: [], attrs: {}};

function mergeDefaults(extraAttributes?: ExtraAttributes): any {
	return {...defaultAttributes, ...extraAttributes};
}
