import {FactoryBuilder} from '../../lib/factory-builder';
import {DefinitionProxy} from '../../lib/definition-proxy';

import {DummyModel} from '../test-fixtures/dummy-model';

import {expect} from 'chai';


describe('Nested factories', function() {
	let factoryBuilder: FactoryBuilder;

	beforeEach(function() {
		factoryBuilder = new FactoryBuilder();
	});

	it('applies attributes from parent attribute', function() {
		factoryBuilder.define((fb: FactoryBuilder) => {
			fb.factory(
				'great-grand-parent',
				DummyModel,
				(f1: DefinitionProxy) => {
					f1.attr('execute1', () => 1);
					f1.attr('execute2', () => 2);

					f1.factory(
						'grand-parent',
						DummyModel,
						(f2: DefinitionProxy) => {
							f2.attr('execute2', () => 20);
							f2.attr('execute3', () => 3);

							f2.factory(
								'parent',
								DummyModel,
								(f3: DefinitionProxy) => {
									f3.attr('execute3', () => 30);
									f3.attr('execute4', () => 4);

									f3.factory(
										'child',
										DummyModel,
										(f4: DefinitionProxy) => {
											f4.attr('execute4', () => 40);
											f4.attr('execute5', () => 5);
										},
									);
								},
							);
						},
					);
				},
			);
		});
		const result = factoryBuilder.attributesFor('child');

		expect(result).to.deep.equal({
			execute1: 1,
			execute2: 20,
			execute3: 30,
			execute4: 40,
			execute5: 5,
		});
	});
});
