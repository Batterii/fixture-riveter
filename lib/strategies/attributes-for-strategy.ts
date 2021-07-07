// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Assembler} from "../assembler";
import {Strategy} from "./strategy";
import {Pojo} from "../types";

export class AttributesForStrategy extends Strategy {
	async result<T>(assembler: Assembler<T>): Promise<Pojo> {
		return assembler.toObject();
	}

	async relation(): Promise<any> {
		return null;
	}
}
