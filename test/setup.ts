import Knex from "knex";
import {CleanOptions, clean} from "knex-cleaner";
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

const options: CleanOptions = {
	mode: "truncate",
	ignoreTables: ["knex_migrations", "knex_migrations_lock"],
};

// Restore sinon's static sandbox after each test.
afterEach(function() {
	sinon.restore();
});


after(async function() {
	await clean(knex, options);
	await knex.destroy();
});
