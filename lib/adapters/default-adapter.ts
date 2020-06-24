import {Adapter} from "./adapter";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class DefaultAdapter implements Adapter {
	build(attributes = {}, Model: any): any {
		return Object.assign(new Model(), attributes);
	}

	async save(instance: any, Model?: any): Promise<any> {
		await instance.save();
		return instance;
	}

	async destroy(instance: any, Model?: any): Promise<any> {
		await instance.destroy();
		return instance;
	}
}
