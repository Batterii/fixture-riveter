import {Assembler} from "../assembler";
import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class AttributesForStrategy extends Strategy {
	async association(fixtureName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.fixtureRiveter.run(fixtureName, "null", traitsAndOverrides);
	}

	async result(assembler: Assembler): Promise<any> {
		return assembler.toObject();
	}
}
