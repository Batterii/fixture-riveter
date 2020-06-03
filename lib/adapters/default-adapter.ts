export interface Adapter {
	build(Model: any, props: Record<string, any>): Record<string, any>;
	save(model: Record<string, any>, Model?: any): Record<string, any>;
	destroy(model: Record<string, any>, Model?: any): Record<string, any>;
}

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
