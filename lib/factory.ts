import { isFunction, first, last } from 'lodash';

export class Factory {
	name: string;
	model: any;
	aliases: string[];
	traits: any[];
	block: Function;
	_attributes: Record<string, any>;

	constructor(
		name: string,
		model: any,
		...rest: any[]
	) {
		this.name = name;
		this.model = model;
		this.aliases = [];
		this.traits = [];
		this._attributes = {};

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
		if (this.block) {
			return this.block();
		}
	}

	names(): string[] {
		return [ this.name, ...this.aliases ];
	}

	defineAttribute(name: string, block: Function): void {
		this._attributes[name] = block;
	}

	// applyAttribute(name: string, object: any): void {
	// 	this.association(name, object);
	// }

	attr(name: string, block?: Function): void {
		if (!block) {
			// this.applyAttribute(name, options);
		} else if (isFunction(block)) {
			this.defineAttribute(name, block);
		} else {
			throw new Error(`wrong options, bruh: ${name}, ${block}`);
		}
	}

	attributes(attrs = {}): any {
		const result = {};
		for (const [ name, block ] of Object.entries(this._attributes)) {
			result[name] = block.call(this);
		}
		return Object.assign(result, attrs);
	}
}
