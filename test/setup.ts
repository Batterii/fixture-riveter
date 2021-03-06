// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import Knex from "knex";
import {KnexCleanerOptions, clean} from "knex-cleaner";
import {Model} from "objection";
import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";

import config from "../knexfile";

chai.use(chaiAsPromised);
chai.use(sinonChai);

const knex = Knex(config); // eslint-disable-line new-cap
Model.knex(knex);

const options: KnexCleanerOptions = {
	mode: "truncate",
	ignoreTables: ["knex_migrations", "knex_migrations_lock"],
};

before(async function() {
	await knex.raw("PRAGMA foreign_keys = ON;");
});

// Restore sinon's static sandbox after each test.
afterEach(function() {
	sinon.restore();
});


after(async function() {
	await clean(knex as any, options);
	await knex.destroy();
});
