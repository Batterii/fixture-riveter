import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class BuildStrategy extends Strategy {
	name: "build";

	async run(instance: any, model: any): Promise<any> {
		return this.adapter.build(instance, model);
	}

	async association(factoryName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.factoryBuilder.run(factoryName, "build", traitsAndOverrides);
	}
}
