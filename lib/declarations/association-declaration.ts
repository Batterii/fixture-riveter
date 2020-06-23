import {Declaration} from "../declaration";
import {AssociationAttribute} from "../attributes/association-attribute";
import {extractAttributes} from "../factory-builder";

import {omit} from "lodash";

export class AssociationDeclaration extends Declaration {
	overrides: any;
	traits: string[];

	constructor(name: string, traitsAndOptions: any[]) {
		super(name);
		this.overrides = extractAttributes(traitsAndOptions);
		this.traits = traitsAndOptions;
	}

	build(): AssociationAttribute[] {
		const factoryName = this.overrides.factory || this.name;
		const overrides = omit(this.overrides, "factory");
		const options = [this.traits, overrides].flat(Infinity);

		return [new AssociationAttribute(this.name, factoryName, options)];
	}
}
