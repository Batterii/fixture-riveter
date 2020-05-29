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

	constructor(
		name: string,
		model: any,
		rest?: OptionsArgs,
	) {
		this.name = name;
		this.model = model;
		this.aliases = [];
		this.traits = [];

		const { options, block } = rest || {};

		if (Boolean(options) && typeof options === 'object') {
			this.aliases = options.aliases || [];
			this.traits = options.traits || [];
		}

		if (Boolean(block) && typeof block === 'function') {
			this.block = block;
		}
	}

	names(): string[] {
		return [ this.name, ...this.aliases ];
	}
}
