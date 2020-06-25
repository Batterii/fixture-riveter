import {CallbackHandler} from "../callback-handler";
import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class AttributesForStrategy extends Strategy {
	name: "attributesFor";

	async association(factoryName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.factoryBuilder.run(factoryName, "null", traitsAndOverrides);
	}

	async result(callbackHandler: CallbackHandler): Promise<any> {
		return callbackHandler.evaluator.run();
	}
}
