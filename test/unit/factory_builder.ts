import { FactoryBuilder } from '../../lib/factory_builder';
import { expect } from 'chai';

class T {
	name: string;

	constructor(name: string) {
		this.name = name;
	}
}

describe('FactoryBuilder', function() {
	let factory: FactoryBuilder;

	describe('#define', function() {
		beforeEach(function() {
			factory = new FactoryBuilder();
			factory.define('t', T);
		});

		it('defines a factory', function() {
			expect(factory.getFactory('t', false)).to.equal(T);
		});

		it('only registers a single factory', function() {
			expect(() => factory.define('t', T)).to.throw();
		});
	});

	describe('#getFactory', function() {
		beforeEach(function() {
			factory = new FactoryBuilder();
			factory.define('t', T);
		});

		it('returns the requested factory', function() {
			const t = factory.getFactory('t');
			expect(t).to.equal(T);
		});

		it('throws if a non-existant factory is requested', function() {
			expect(() => factory.getFactory('f')).to.throw();
		});
	});
});


// import { Asset, AssetType } from '../../lib/models/asset';
// import _ from 'lodash';
// import { factory } from 'factory-bot';

// factory.define('asset', Asset, {
// 	projectId: factory.assoc('project', 'id'),
// 	type: () => _.sample(Object.values(AssetType)) as AssetType,
// });
