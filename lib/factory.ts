import {isFunction, first, last} from 'lodash';

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

	async applyAttributes(extraAttributes = {}): Promise<any> {
		const instance = {};
		for (const [attrName, block] of Object.entries(this.attributes)) {
			// eslint-disable-next-line no-await-in-loop
			instance[attrName] = await block.call(this);
		}
		return Object.assign(instance, extraAttributes);
	}
}
