import {Adapter} from "./adapter";

/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class DefaultAdapter implements Adapter {
	build<T>(Model: any): T {
		return new Model();
	}

	async save<T>(instance: any, _Model?: any): Promise<T> {
		return instance.save();
	}

	async destroy(instance: any, _Model?: any): Promise<void> {
		await instance.destroy();
	}

	async relate(instance: any, name: string, other: any, _Model?: any): Promise<any> {
		return this.set(instance, name, other);
	}

	set(instance: any, key: string, value: any): any {
		instance[key] = value;
		return instance;
	}
}
