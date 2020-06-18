import {Attribute} from "./attribute";

export abstract class Declaration {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	abstract build(): Attribute[];
}
