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

	declareAttribute(declaration: Declaration): Declaration {
		this.declarations.push(declaration);
		return declaration;
	}

	toAttributes(): Attribute[] {
		return this.declarations.flatMap((d) => d.build());
	}

	getAttributes(): Attribute[] {
		if (!this.attributes) {
			this.attributes = this.toAttributes();
		}
		return this.attributes;
	}
}
