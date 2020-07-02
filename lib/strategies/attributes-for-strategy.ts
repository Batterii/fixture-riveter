import {Assembler} from "../assembler";
import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class AttributesForStrategy extends Strategy {
	async association(factoryName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.factoryBuilder.run(factoryName, "null", traitsAndOverrides);
	}

	async result(assembler: Assembler): Promise<any> {
		return assembler.toObject();
	}
}
