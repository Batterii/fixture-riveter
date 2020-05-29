interface Options {
	aliases?: string[];
	traits?: any[];
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
		options: any = {},
		block?: Function,
	) {
		this.name = name;
		this.model = model;
		this.aliases = options.aliases || [];
		this.traits = options.traits;
		if (block) {
			this.block = block;
		}
	}

	names(): string[] {
		return [ this.name, ...this.aliases ];
	}
}
