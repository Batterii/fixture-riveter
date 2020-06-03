/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class DefaultAdapter {
	build(Model: any, props = {}): any {
		return Object.assign(new Model(), props);
	}

	async save(model: any, Model?: any): Promise<any> {
		await model.save();
		return model;
	}

	async destroy(model: any, Model?: any): Promise<any> {
		await model.destroy();
		return model;
	}
}
