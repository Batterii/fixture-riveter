import {DefaultAdapter} from "./default-adapter";

/* eslint-disable class-methods-use-this */
export class ObjectionAdapter extends DefaultAdapter {
	build(Model: any, attributes = {}): any {
		const instance = new Model();
		return instance.$setJson(attributes);
	}

	async save(instance: any, Model: any): Promise<any> {
		return Model.query().insert(instance);
	}

	async destroy(instance: any, Model: any): Promise<any> {
		return Model.query().deleteById(instance.id);
	}

	set(instance: any, key: string, value: any): any {
		instance.$setJson({[key]: value});
		return instance;
	}
}
