import {Adapter} from "./adapter";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class DefaultAdapter implements Adapter {
	build(Model: any, attributes = {}): any {
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

	set(instance: any, key: string, value: any): any {
		instance[key] = value;
		return instance;
	}
}
