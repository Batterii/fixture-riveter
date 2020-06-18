import {Attribute} from "./attribute";
import {Declaration} from "./declaration";

export class DeclarationHandler {
	name: string;
	declarations: Declaration[];
	attributes: Attribute[];

	constructor(name: string) {
		this.name = name;
		this.declarations = [];
	}

	declareAttribute(declaration: Declaration): void {
		this.declarations.push(declaration);
	}

	convertToAttributes(): Attribute[] {
		if (!this.attributes) {
			this.attributes = this.toAttributes();
		}
		return this.attributes;
	}

	toAttributes(): Attribute[] {
		return this.declarations.reduce<Attribute[]>((acc, d) => {
			return acc.concat(d.build());
		}, []);
	}
}
