import {Attribute} from "../attributes/attribute";

export abstract class Declaration {
	name: string;
	ignored: boolean;

	constructor(name: string, ignored = false) {
		this.name = name;
		this.ignored = ignored;
	}

	abstract build(): Attribute[];
}
