// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Adapter} from "./adapter";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export class DefaultAdapter implements Adapter {
	build(Model: any): any {
		return new Model();
	}

	async save(instance: any, _Model?: any): Promise<any> {
		return instance.save();
	}

	async destroy(instance: any, _Model?: any): Promise<void> {
		await instance.destroy();
	}

	relate(instance: any, name: string, other: any, _Model?: any): any {
		instance[name] = other;
		return instance;
	}

	set(instance: any, key: string, value: any): any {
		instance[key] = value;
		return instance;
	}
}
