// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Evaluator} from "../evaluator";

export interface Adapter {
	build<T>(Model: any, evaluator?: Evaluator): T|Promise<T>;
	save<T>(instance: T, Model?: any): Promise<T>;
	destroy<T>(instance: T, Model?: any): Promise<void>;
	relate<T>(instance: T, name: string, other: any, Model?: any): T|Promise<T>;
	set<T>(instance: T, key: string, value: any): T|Promise<T>;
}
