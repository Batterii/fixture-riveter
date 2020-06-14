export abstract class Attribute {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	build(): Function {
		return function() {}; // eslint-disable-line @typescript-eslint/no-empty-function
	}
}
