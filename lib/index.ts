// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {FixtureRiveter} from "./fixture-riveter";

import {Adapter} from "./adapters/adapter";
import {DefaultAdapter} from "./adapters/default-adapter";
import {ObjectionAdapter} from "./adapters/objection-adapter";
import {SequelizeAdapter} from "./adapters/sequelize-adapter";

import {Strategy} from "./strategies/strategy";
import {AttributesForStrategy} from "./strategies/attributes-for-strategy";
import {BuildStrategy} from "./strategies/build-strategy";
import {CreateStrategy} from "./strategies/create-strategy";

const fr = new FixtureRiveter();

export {
	fr,
	FixtureRiveter,

	Adapter,
	DefaultAdapter,
	ObjectionAdapter,
	SequelizeAdapter,

	Strategy,
	AttributesForStrategy,
	BuildStrategy,
	CreateStrategy,
};
