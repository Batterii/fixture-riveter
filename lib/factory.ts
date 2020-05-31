import { isFunction, first, last } from 'lodash';

export interface OptionsArgs {
	options?: {
		aliases?: string[];
		traits?: any[];
	};
	block?: Function;
}

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
		rest?: OptionsArgs,
	) {
		this.name = name;
		this.model = model;
		this.aliases = [];
		this.traits = [];
		this._attributes = {};

		const { options, block } = rest || {};

		if (options && options.aliases) {
			this.aliases = options.aliases;
		}
		if (options && options.traits) {
			this.traits = options.traits;
		}

		if (block) {
			this.block = block;
		}
	}

	compile(): void {
		if (this.block) {
			this.block();
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

	attr(name: string, ...rest: any): void {
		const options: Record<string, any> | undefined = first(rest);
		const block: Function | undefined = last(rest);

		if ((rest.length === 1) && block && isFunction(block)) {
			this.defineAttribute(name, block);
		} else if (options && validOptions(options)) {
			// this.applyAttribute(name, options);
			console.log(`applyAttribute ${options}`);
		} else {
			throw new Error(`wrong options, bruh: ${options}`);
		}
	}

	attributes(attrs = {}): any {
		const result = {};
		for (const [ name, block ] of Object.entries(this._attributes)) {
			result[name] = block();
		}
		return Object.assign(result, attrs);
	}
}

function validOptions(options: Record<string, any>): boolean {
	if (options) {
		return true;
	}

	return false;
}
