import {Adapter} from "./adapter";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class DefaultAdapter implements Adapter {
	build(Model: any): any {
		return new Model();
	}

	async save(instance: any, Model?: any): Promise<any> {
		await instance.save();
		return instance;
	}

	set(instance: any, key: string, value: any): any {
		instance[key] = value;
		return instance;
	}
}
