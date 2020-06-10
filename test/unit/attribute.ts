import {Attribute} from '../../lib/attribute';

import {identity} from 'lodash';
import {expect} from 'chai';

describe('Attribute', function() {
	it('creates an instance of Attribute', function() {
		const name = 'email';
		const result = new Attribute(name, identity);
		expect(result).to.be.an.instanceof(Attribute);
		expect(result.name).to.equal(name);
		expect(result.block).to.equal(identity);
	});

	describe('#build', function() {
		it('returns value of block', function() {
			const attribute = new Attribute('email', () => 1);
			const result = attribute.build();
			expect(result).to.equal(1);
		});
	});
});
