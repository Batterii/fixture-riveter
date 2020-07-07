import {Declaration} from "./declaration";
import {AssociationAttribute} from "../attributes/association-attribute";
import {extractAttributes} from "../fixture-riveter";

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
		const fixtureName = this.overrides.fixture || this.name;
		const overrides = omit(this.overrides, "fixture");
		const options = [this.traits, overrides].flat(Infinity);

		return [new AssociationAttribute(this.name, fixtureName, options)];
	}
}
