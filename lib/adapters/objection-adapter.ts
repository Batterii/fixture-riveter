// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {DefaultAdapter} from "./default-adapter";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class ObjectionAdapter extends DefaultAdapter {
	async save(instance: any, Model: any): Promise<any> {
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
