import {Assembler} from "../assembler";
import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class BuildStrategy extends Strategy {
	async result<T>(assembler: Assembler<T>): Promise<T> {
		const instance = await assembler.toInstance();
		await assembler.runCallbacks("afterBuild", instance);

		return instance;
	}

	async relation(fixtureName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.fixtureRiveter.run(fixtureName, "build", traitsAndOverrides);
	}
}
