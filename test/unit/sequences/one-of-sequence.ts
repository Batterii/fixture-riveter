import {OneOfSequence} from "../../../lib/sequences/one-of-sequence";

import _ from "lodash";
import {expect} from "chai";
import sinon from "sinon";

describe.only("OneOfSequence", function() {
	it("returns an instance", function() {
		const seq = new OneOfSequence("name", [1, 2]);
		expect(seq).to.exist;
		expect(seq).to.be.an.instanceof(OneOfSequence);
	});

	describe("#next", function() {
		it("returns the only value when given a list of length 1", function() {
			const seq = new OneOfSequence("name", [1]);
			const result = seq.next();
			expect(result).to.equal(1);
		});

		it("calls lodash sample correctly", function() {
			const seq = new OneOfSequence("name", [1, 2]);
			sinon.stub(_, "sample").returns(2 as any);
			const result = seq.next();
			expect(result).to.equal(2);
		});

		it("uses available callback", function() {
			const seq = new OneOfSequence("name", [1]);
			seq.callback = (x: string) => x.toString();
			const result = seq.next();
			expect(result).to.equal("1");
		});
	});

	describe("iterator", function() {
		it("acts like an iterator", function() {
			const choices = [1, 2, 3];
			const seq = new OneOfSequence("name", choices);
			const result = [] as any;
			for (const char of seq) {
				result.push(char);
				if (result.length >= 3) {
					break;
				}
			}
			expect(result).to.have.length(3);
			for (const n of result) {
				expect(choices.includes(n)).to.be.true;
			}
		});
	});
});
