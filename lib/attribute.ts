export class Attribute {
	name: string;
	block: Function;

	constructor(name: string, block: Function) {
		this.name = name;
		this.block = block;
	}

	execute(): any {
		return this.block();
	}
}
