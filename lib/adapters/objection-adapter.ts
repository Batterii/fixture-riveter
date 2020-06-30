import {DefaultAdapter} from "./default-adapter";

/* eslint-disable class-methods-use-this */
export class ObjectionAdapter extends DefaultAdapter {
	async save(instance: any, Model: any): Promise<any> {
		return Model.query().insert(instance);
	}

	async associate(instance: any, name: string, other: any): Promise<any> {
		await instance.$relatedQuery(name).relate(other.id);
		instance.$setRelated(name, other);
	}

	set(instance: any, key: string, value: any): any {
		instance.$setJson({[key]: value});
		return instance;
	}
}
