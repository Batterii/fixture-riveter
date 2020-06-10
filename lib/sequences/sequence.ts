export abstract class Sequence {
	name: string;
	aliases: string[];
	callback: Function;

	constructor(name: string, options?: any) {
		this.name = name;
		this.aliases = [];
		this.callback = (x: any) => x;

		if (options) {
			if (options.aliases) {
				this.aliases = options.aliases;
			}
			if (options.callback) {
				this.callback = options.callback;
			}
		}
	}

	names(): string[] {
		return [this.name, ...this.aliases];
	}

	*[Symbol.iterator](): any {
		while (true) {
			yield this.next();
		}
	}

	abstract increment(): void;
	abstract next(): void;
	abstract reset(): void;
}
