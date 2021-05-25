import {Attribute} from "./attribute";
import {Evaluator} from "../evaluator";

export class RelationAttribute extends Attribute {
	fixture: string[];
	overrides: any[];

	constructor(name: string, fixture: string | string[], overrides: any[]) {
		super(name, false);
		this.fixture = Array.isArray(fixture) ? fixture : [fixture];
		this.overrides = overrides;
		this.isRelation = true;
	}

	evaluate(): (evaluator: Evaluator) => Promise<Record<string, any>> {
		const traitsAndOverrides = Array.prototype.concat(this.fixture, this.overrides);
		const fixtureName = traitsAndOverrides.shift();

		return async(evaluator: Evaluator) => {
			return evaluator.relation(fixtureName, ...traitsAndOverrides);
		};
	}
}
