export class Sequence {
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

	// eslint-disable-next-line class-methods-use-this
	next(): void {
		throw new Error(`${this.name} needs an implementation of next`);
	}

	*[Symbol.iterator](): any {
		while (true) {
			yield this.next();
		}
	}
}
