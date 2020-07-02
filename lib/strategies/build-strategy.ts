import {Assembler} from "../assembler";
import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class BuildStrategy extends Strategy {
	async association(factoryName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.factoryBuilder.run(factoryName, "build", traitsAndOverrides);
	}

	async result(assembler: Assembler): Promise<any> {
		const instance = await assembler.toInstance();
		await assembler.runCallbacks("afterBuild", instance);

		return instance;
	}
}
