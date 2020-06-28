import {Attribute} from "../attribute";
import {Evaluator} from "../evaluator";

export class AssociationAttribute extends Attribute {
	factory: string;
	overrides: any[];

	constructor(name: string, factory: string, overrides: any[]) {
		super(name);
		this.factory = factory;
		this.overrides = overrides;
		this.isAssociation = true;
	}

	evaluate(evaluator: Evaluator): () => Promise<Record<string, any>> {
		const traitsAndOverrides = [this.factory, this.overrides].flat();
		const factoryName = traitsAndOverrides.shift();

		return async() => {
			return evaluator.association(factoryName, ...traitsAndOverrides);
		};
	}
}
