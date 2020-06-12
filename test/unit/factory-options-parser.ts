import {factoryOptionsParser, FactoryOptions} from '../../lib/factory-options-parser';

import {expect} from 'chai';

describe('factoryOptionsParser', function() {
	it('returns an array', function() {
		const result = factoryOptionsParser();
		expect(result).to.be.an.instanceof(Array);
	});

	it('returns an empty object and undefined when given nothing', function() {
		const [resultObj, resultFn] = factoryOptionsParser();
		expect(resultObj).to.deep.equal({});
		expect(resultFn).to.be.undefined;
	});

	it('accepts an object as the only argument', function() {
		const options = {temp: 1} as FactoryOptions;
		const [result] = factoryOptionsParser(options);
		expect(result).to.deep.equal(options);
	});

	it('accepts a function as the only argument', function() {
		const options = (x: any) => x;
		const [, resultFn] = factoryOptionsParser(options);
		expect(resultFn).to.be.a('function');
		expect(resultFn).to.equal(options);
	});

	it('accepts both an object and a function', function() {
		const objOption = {temp: 1} as FactoryOptions;
		const fnOption = (x: any) => x;
		const [resultObj, resultFn] = factoryOptionsParser(objOption, fnOption);
		expect(resultObj).to.deep.equal(objOption);
		expect(resultFn).to.equal(fnOption);
	});
});
