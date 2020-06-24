import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class CreateStrategy extends Strategy {
	name: "create";

	async run(instance: any, model: any): Promise<any> {
		const builtInstance = this.adapter.build(instance, model);
		return this.adapter.save(builtInstance, model);
	}

	async association(): Promise<any> {
		return {};
	}
}
