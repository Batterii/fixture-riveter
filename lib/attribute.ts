export class Attribute {
	name: string;
	block: Function;

	constructor(name: string, block: Function) {
		this.name = name;
		this.block = block;
	}

	build(): any {
		return this.block();
	}
}
