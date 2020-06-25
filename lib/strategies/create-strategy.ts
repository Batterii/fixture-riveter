import {CallbackHandler} from "../callback-handler";
import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class CreateStrategy extends Strategy {
	name: "create";

	async association(factoryName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.factoryBuilder.run(factoryName, "create", traitsAndOverrides);
	}

	async result(callbackHandler: CallbackHandler, model: any): Promise<any> {
		let instance = await callbackHandler.evaluator.run();

		instance = this.adapter.build(instance, model);
		await callbackHandler.runCallbacks("afterBuild", instance);

		await callbackHandler.runCallbacks("beforeCreate", instance);
		instance = await this.adapter.save(instance, model);
		await callbackHandler.runCallbacks("afterCreate", instance);

		return instance;
	}
}
