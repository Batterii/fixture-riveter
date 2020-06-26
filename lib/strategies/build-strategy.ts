import {CallbackHandler} from "../callback-handler";
import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class BuildStrategy extends Strategy {
	name: "build";

	async association(factoryName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.factoryBuilder.run(factoryName, "build", traitsAndOverrides);
	}

	async result(callbackHandler: CallbackHandler, model: any): Promise<any> {
		let instance = await callbackHandler.evaluator.run();

		instance = this.adapter.build(instance, model);
		await callbackHandler.runCallbacks("afterBuild", instance);

		return instance;
	}
}
