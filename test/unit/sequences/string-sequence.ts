import {StringSequence} from '../../../lib/sequences/string-sequence';

import {expect} from 'chai';
import sinon from 'sinon';

describe('StringSequence', function() {
	it('returns an instance', function() {
		const seq = new StringSequence('name');
		expect(seq).to.exist;
		expect(seq).to.be.an.instanceof(StringSequence);
	});

	it('accepts an initial character', function() {
		const seq = new StringSequence('name', {initial: 'x'});
		const result = seq.next();
		expect(result).to.equal('x');
	});

	describe('#generateInitialIndex', function() {
		it('returns initialIndex when passed no arguments', function() {
			const seq = new StringSequence('name');
			seq.initialChar = 'k';
			const result = seq.generateInitialIndex();
			expect(result).to.deep.equal([10]);
		});

		it('calls indexOf to get new index', function() {
			const seq = new StringSequence('name');
			seq.alphabet = 'abcde';
			expect(seq.generateInitialIndex('a')).to.deep.equal([0]);
			expect(seq.generateInitialIndex('d')).to.deep.equal([3]);
			expect(seq.generateInitialIndex('f')).to.deep.equal([0]);
			expect(seq.generateInitialIndex('+')).to.deep.equal([0]);
		});
	});

	describe('#reset', function() {
		it('calls generateInitialIndex', function() {
			const seq = new StringSequence('name');
			const spy = sinon.spy(seq, 'generateInitialIndex');
			seq.reset();
			expect(spy).to.be.calledOnce;
		});

		it('calls generateInitialIndex with given argument', function() {
			const seq = new StringSequence('name');
			const spy = sinon.spy(seq, 'generateInitialIndex');
			seq.reset('a');
			expect(spy).to.be.calledOnceWithExactly('a');
		});

		it('sets id correctly', function() {
			const seq = new StringSequence('name');
			sinon.stub(seq, 'generateInitialIndex').returns([0]);
			seq.reset();
			expect(seq.indicies).to.deep.equal([0]);
		});
	});

	describe('#increment', function() {
		let seq: StringSequence;

		beforeEach(function() {
			seq = new StringSequence('name');
			seq.alphabet = 'abcde';
		});

		it('increases singular value by 1', function() {
			seq.indicies = [0];
			seq.increment();
			expect(seq.indicies).to.deep.equal([1]);
		});

		it('increases singular value up to limit', function() {
			seq.indicies = [3];
			seq.increment();
			expect(seq.indicies).to.deep.equal([4]);
		});

		it('sets value to 0 and adds digit when increasing to alphabet length', function() {
			seq.indicies = [4];
			seq.increment();
			expect(seq.indicies).to.deep.equal([0, 0]);
		});

		it('increases left-most value by 1', function() {
			seq.indicies = [0, 0];
			seq.increment();
			expect(seq.indicies).to.deep.equal([1, 0]);
		});

		it('increases next value when left-most increases to alphabet length', function() {
			seq.indicies = [4, 3];
			seq.increment();
			expect(seq.indicies).to.deep.equal([0, 4]);
		});

		it('sets all values to 0 and adds digit when increasing to alphabet length', function() {
			seq.indicies = [4, 4];
			seq.increment();
			expect(seq.indicies).to.deep.equal([0, 0, 0]);
		});
	});

	describe('#next', function() {
		let seq: StringSequence;

		beforeEach(function() {
			seq = new StringSequence('name');
			seq.alphabet = 'abcde';
		});

		it('returns single character at index when given single value', function() {
			seq.indicies = [0];
			const result = seq.next();
			expect(result).to.equal('a');
		});

		it('uses index appropriately', function() {
			seq.indicies = [4];
			const result = seq.next();
			expect(result).to.equal('e');
		});

		it('returns a string with no spaces when given 2 indicies', function() {
			seq.indicies = [0, 0];
			const result = seq.next();
			expect(result).to.equal('aa');
		});

		it('increments indicies after generating result', function() {
			seq.indicies = [4];
			const result = seq.next();
			expect(result).to.equal('e');
			expect(seq.indicies).to.deep.equal([0, 0]);
		});

		it('increments correctly when called multiple times', function() {
			seq.indicies = [4];
			seq.next();
			seq.next();
			const result = seq.next();
			expect(result).to.equal('ab');
			expect(seq.indicies).to.deep.equal([2, 0]);
		});

		it('uses available callback', function() {
			seq.indicies = [0, 0, 0];
			seq.callback = (x: string) => x.concat('foobar');
			const result = seq.next();
			expect(result).to.equal('aaafoobar');
		});
	});

	describe('iterator', function() {
		it('acts like an iterator', function() {
			const seq = new StringSequence('name');
			const result = [] as any;
			for (const char of seq) {
				result.push(char);
				if (result.length >= 5) {
					break;
				}
			}
			expect(result).to.deep.equal(['a', 'b', 'c', 'd', 'e']);
		});
	});
});
