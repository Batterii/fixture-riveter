import {DynamicAttribute} from '../../../lib/attributes/dynamic-attribute';

import {identity} from 'lodash';
import {expect} from 'chai';

describe('DynamicAttribute', function() {
	it('creates an instance of DynamicAttribute', function() {
		const name = 'email';
		const result = new DynamicAttribute(name, identity);
		expect(result).to.be.an.instanceof(DynamicAttribute);
		expect(result.name).to.equal(name);
		expect(result.block).to.equal(identity);
	});

	describe('#build', function() {
		it('returns value of block', function() {
			const attribute = new DynamicAttribute('email', () => 1);
			const result = attribute.build();
			expect(result()).to.equal(1);
		});
	});
});
