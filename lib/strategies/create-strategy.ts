import {Assembler} from "../assembler";
import {ModelConstructor} from "../fixture-riveter";
import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class CreateStrategy extends Strategy {
	async association(fixtureName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.fixtureRiveter.run(fixtureName, "create", traitsAndOverrides);
	}

	async result<T>(assembler: Assembler<T>, model: ModelConstructor<T>): Promise<T> {
		let instance = await assembler.toInstance();
		await assembler.runCallbacks("afterBuild", instance);
		await assembler.runCallbacks("beforeCreate", instance);
		instance = await this.adapter.save(instance, model);
		await assembler.runCallbacks("afterCreate", instance);

		return instance;
	}
}
