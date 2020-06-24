import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class AttributesForStrategy extends Strategy {
	name: "attributesFor";

	async run(instance: any): Promise<any> {
		return instance;
	}

	async association(factoryName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.factoryBuilder.run(factoryName, "null", traitsAndOverrides);
	}
}
