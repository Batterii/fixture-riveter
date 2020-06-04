import Knex from 'knex';
import {CleanOptions, clean} from 'knex-cleaner';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';

import config from '../knexfile';

chai.use(chaiAsPromised);
chai.use(sinonChai);

const knex = Knex(config.development); // eslint-disable-line new-cap

// Restore sinon's static sandbox after each test.
afterEach(function() {
	sinon.restore();
});


after(async function() {
	await clean(knex);
	await knex.destroy();
});
