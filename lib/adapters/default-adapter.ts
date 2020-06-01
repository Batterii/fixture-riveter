export class DefaultAdapter {
	name = 'default';

	static build(Model: any, props = {}): any {
		return Object.assign(new Model(), props);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static async save(model: any, Model?: any): Promise<any> {
		return Promise.resolve(model.save()).then(() => model);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static async destroy(model: any, Model: any): Promise<any> {
		return Promise.resolve(model.destroy()).then(() => model);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static get(model: any, attribute: any, Model: any): any {
		return model[attribute];
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static set(model: any, props: any, Model: any): any {
		return model.set(props);
	}
}
