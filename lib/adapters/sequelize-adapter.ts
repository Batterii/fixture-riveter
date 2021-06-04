// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {DefaultAdapter} from "./default-adapter";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class SequelizeAdapter extends DefaultAdapter {
	build(Model: any): any {
		return Model.build();
	}

	async relate(instance: any, name: string, other: any): Promise<any> {
		// To do: figure out how to do this
		instance = instance.set(`${name}Id`, other.get("id"));
		return instance;
	}

	set(instance: any, key: string, value: any): any {
		return instance.set(key, value);
	}
}
