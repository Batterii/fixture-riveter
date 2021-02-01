import {DefaultAdapter} from "./default-adapter";

/* eslint-disable class-methods-use-this */
export class ObjectionAdapter extends DefaultAdapter {
	async save<T>(instance: T, Model: any): Promise<T> {
		return Model.query().insertAndFetch(instance);
	}

	async destroy(instance: any): Promise<void> {
		if (instance.$query) {
			try {
				await instance.$query().delete();
			} catch (e) {
				// Do nothing
			}
		}
	}

	async relate(instance: any, name: string, other: any, Model?: any): Promise<any> {
		instance.$setRelated(name, other);

		const relations = Model.getRelations();
		const selfIdCols = relations[name].ownerProp.cols;
		const relationIdCols = relations[name].relatedProp.cols;
		if (selfIdCols.length === 1 && relationIdCols.length === 1) {
			const [selfIdCol] = selfIdCols;
			const [relationIdCol] = relationIdCols;
			instance = this.set(instance, selfIdCol, other[relationIdCol]);
		}
		return instance;
	}

	set(instance: any, key: string, value: any): any {
		instance.$setJson({[key]: value});
		return instance;
	}
}
