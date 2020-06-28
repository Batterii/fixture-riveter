import {Assembler} from "../assembler";
import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class CreateStrategy extends Strategy {
	name: "create";

	async association(factoryName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.factoryBuilder.run(factoryName, "create", traitsAndOverrides);
	}

	async result(assembler: Assembler, model: any): Promise<any> {
		let instance = await assembler.toInstance();
		await assembler.runCallbacks("afterBuild", instance);
		await assembler.runCallbacks("beforeCreate", instance);
		instance = await this.adapter.save(instance, model);
		await assembler.runCallbacks("afterCreate", instance);

		return instance;
	}
}
