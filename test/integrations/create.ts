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
			fb.factory('user', User, (f: any) => {
				f.attr('name', () => 'Noah');
				f.attr('age', () => 32);
				f.sequence('email', (n: number) => `test${n}@foo.bar`);
			});
		});
	});

	it('inserts into the database', async function() {
		const model = await fb.create('user', {attrs: {name: 'Bogart'}});
		const model2 = await fb.create('user');

		expect(model.id).to.exist;
		expect(model.name).to.equal('Bogart');
		expect(model.email).to.equal('test1@foo.bar');
		expect(model2.email).to.equal('test2@foo.bar');
		expect(model).to.be.an.instanceof(User);

		expect(model.email).to.not.equal(model2.email);

		const user = await User.query().findById(model.id);
		expect(user.id).to.equal(model.id);
	});
});
