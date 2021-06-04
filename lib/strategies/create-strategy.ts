// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Assembler} from "../assembler";
import {Strategy} from "./strategy";
import {ModelConstructor} from "../types";

/* eslint-disable class-methods-use-this */
export class CreateStrategy extends Strategy {
	async result<T>(assembler: Assembler<T>, model: ModelConstructor<T>): Promise<T> {
		let instance = await assembler.toInstance();
		await assembler.runHooks("afterBuild", instance);
		await assembler.runHooks("beforeCreate", instance);
		instance = await assembler.save(instance, model);
		await assembler.runHooks("afterCreate", instance);

		return instance;
	}

	async relation(fixtureName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.fixtureRiveter.run(fixtureName, "create", traitsAndOverrides);
	}
}
