import {User} from '../test-fixtures/user';

import {FactoryBuilder} from '../../lib/factory-builder';

import {expect} from 'chai';

describe.only('Traits', function() {
	let fb: FactoryBuilder;

	beforeEach(function() {
		fb = new FactoryBuilder();

		fb.define(function() {
			fb.factory('user', User, (f: any) => {
				f.attr('name', () => 'Noah');
				f.attr('age', () => 32);
				f.sequence('email', (n: number) => `test${n}@foo.bar`);

				f.trait('old', (t: any) => {
					t.attr('age', () => 100);
				});
			});
		});
	});

	it('can apply traits to a factory instance', async function() {
		const model = await fb.attributesFor('user', 'old', {name: 'Bogart'});
		expect(model.age).to.equal(100);
		expect(model.name).to.equal('Bogart');
	});
});
