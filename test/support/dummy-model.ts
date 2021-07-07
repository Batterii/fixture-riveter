// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

export class DummyModel {
	name: string;
	age: number;

	constructor(name?: string, age?: number) {
		this.name = name || "Noah";
		this.age = age || 32;
	}

	async save(): Promise<any> {
		return this;
	}
}
