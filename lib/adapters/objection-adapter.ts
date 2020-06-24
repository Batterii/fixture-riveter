import {DefaultAdapter} from "./default-adapter";

/* eslint-disable class-methods-use-this */
export class ObjectionAdapter extends DefaultAdapter {
	async save(instance: any, Model: any): Promise<any> {
		return Model.query().insert(instance);
	}

	async destroy(instance: any, Model: any): Promise<any> {
		return Model.query().deleteById(instance.id);
	}
}
