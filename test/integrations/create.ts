import {User} from '../test-fixtures/user';

import {ObjectionAdapter} from '../../lib/adapters/objection-adapter';
import {FactoryBuilder} from '../../lib/factory-builder';

import {expect} from 'chai';

describe('#create', function() {
	let fb: FactoryBuilder;

	beforeEach(function() {
		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());

		fb.define(function() {
			this.factory('user', User, function() {
				this.attr('name', () => 'Noah');
				this.attr('age', () => 32);
			});
		});
	});

	it('inserts into the database', async function() {
		const model = await fb.create('user', {attrs: {name: 'Bogart'}});

		expect(model.id).to.exist;
		expect(model.name).to.equal('Bogart');
		expect(model).to.be.an.instanceof(User);

		const user = await User.query().findById(model.id);
		expect(user.id).to.equal(model.id);
	});
});
