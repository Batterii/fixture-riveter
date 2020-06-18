import {SequenceAttribute} from "../../../lib/attributes/sequence-attribute";
import {Sequence} from "../../../lib/sequences/sequence";
import {IntegerSequence} from "../../../lib/sequences/integer-sequence";

import {expect} from "chai";

describe("SequenceAttribute", function() {
	it("creates an instance of SequenceAttribute", function() {
		const name = "email";
		const sequence = {} as Sequence;
		const result = new SequenceAttribute(name, sequence);

		expect(result).to.be.an.instanceof(SequenceAttribute);
		expect(result.name).to.equal(name);
		expect(result.sequence).to.equal(sequence);
	});

	describe("#build", function() {
		it("returns a function that calls #next()", function() {
			const options = {callback: (n: number) => `Name ${n}`};
			const sequence = new IntegerSequence("email", options);
			const attribute = new SequenceAttribute("email", sequence);
			const result = attribute.build();

			expect(result()).to.equal("Name 1");
			expect(result()).to.equal("Name 2");
		});
	});
});
