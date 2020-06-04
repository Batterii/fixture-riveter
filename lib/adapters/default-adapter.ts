import {Adapter} from './adapter';

/* eslint-disable class-methods-use-this */
export class DefaultAdapter implements Adapter {
	build(Model: any, props = {}): any {
		return Object.assign(new Model(), props);
	}

	async save(model: any): Promise<any> {
		await model.save();
		return model;
	}

	async destroy(model: any): Promise<any> {
		await model.destroy();
		return model;
	}
}
