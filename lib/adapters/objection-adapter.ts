import {DefaultAdapter} from './default-adapter';

/* eslint-disable class-methods-use-this */
export class ObjectionAdapter extends DefaultAdapter {
	build(Model: any, props = {}): any {
		return Object.assign(new Model(), props);
	}

	async save(model: any, Model: any): Promise<any> {
		return Model.query().insert(model);
	}

	async destroy(model: any, Model: any): Promise<any> {
		return Model.query().deleteById(model.id);
	}
}
