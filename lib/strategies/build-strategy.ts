// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Assembler} from "../assembler";
import {Strategy} from "./strategy";

/* eslint-disable class-methods-use-this */
export class BuildStrategy extends Strategy {
	async result<T>(assembler: Assembler<T>): Promise<T> {
		const instance = await assembler.toInstance();
		await assembler.runHooks("afterBuild", instance);

		return instance;
	}

	async relation(fixtureName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.fixtureRiveter.run(fixtureName, "build", traitsAndOverrides);
	}
}
