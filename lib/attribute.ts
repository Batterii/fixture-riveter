/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
export abstract class Attribute {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	abstract build(): Function;
}
