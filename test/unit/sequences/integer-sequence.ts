import {IntegerSequence} from '../../../lib/sequences/integer-sequence';

import {expect} from 'chai';

describe('IntegerSequence', function() {
	it('returns an instance', function() {
		const seq = new IntegerSequence();
		expect(seq).to.exist;
		expect(seq).to.be.an.instanceof(IntegerSequence);
	});

	it('accepts an initial character', function() {
		const seq = new IntegerSequence(5);
		const result = seq.next();
		expect(result).to.equal(5);
	});

	describe('#reset', function() {
		it('sets id correctly', function() {
			const seq = new IntegerSequence();
			seq.reset();
			expect(seq.index).to.deep.equal(1);
		});
	});

	describe('#increment', function() {
		let seq: IntegerSequence;

		beforeEach(function() {
			seq = new IntegerSequence();
			seq.index = 1;
		});

		it('increases singular value by 1', function() {
			seq.index = 0;
			seq.increment();
			expect(seq.index).to.deep.equal(1);
		});

		it('increases singular value up to limit', function() {
			seq.index = 3;
			seq.increment();
			expect(seq.index).to.deep.equal(4);
		});

		it('increases singular value up to limit', function() {
			seq.index = 9;
			seq.increment();
			expect(seq.index).to.deep.equal(10);
		});
	});

	describe('#next', function() {
		let seq: IntegerSequence;

		beforeEach(function() {
			seq = new IntegerSequence();
			seq.index = 1;
		});

		it('returns single character at index when given single value', function() {
			const result = seq.next();
			expect(result).to.equal(1);
		});

		it('uses index appropriately', function() {
			seq.index = 4;
			const result = seq.next();
			expect(result).to.equal(4);
		});

		it('increments index after generating result', function() {
			seq.index = 4;
			const result = seq.next();
			expect(result).to.equal(4);
			expect(seq.index).to.deep.equal(5);
		});

		it('increments correctly when called multiple times', function() {
			seq.index = 4;
			seq.next();
			seq.next();
			const result = seq.next();
			expect(result).to.equal(6);
			expect(seq.index).to.deep.equal(7);
		});

		it('accepts a callback', function() {
			const result = seq.next((x: string) => x.toString());
			expect(result).to.equal('1');
		});
	});

	describe('iterator', function() {
		it('acts like an iterator', function() {
			const seq = new IntegerSequence();
			const result = [] as any;
			for (const char of seq) {
				result.push(char);
				if (result.length >= 5) {
					break;
				}
			}
			expect(result).to.deep.equal([1, 2, 3, 4, 5]);
		});
	});
});
