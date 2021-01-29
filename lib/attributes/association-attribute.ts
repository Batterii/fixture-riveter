import {Attribute} from "./attribute";
import {Evaluator} from "../evaluator";

export class AssociationAttribute extends Attribute {
	fixture: string | string[];
	overrides: any[];

	constructor(name: string, fixture: string | string[], overrides: any[]) {
		super(name, false);
		this.fixture = fixture;
		this.overrides = overrides;
		this.isAssociation = true;
	}

	evaluate(evaluator: Evaluator): () => Promise<Record<string, any>> {
		const traitsAndOverrides = [this.fixture, this.overrides].flat();
		const fixtureName = traitsAndOverrides.shift();

		return async() => {
			return evaluator.association(fixtureName, ...traitsAndOverrides);
		};
	}
}
