// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {SequenceAttribute} from "../../../lib/attributes/sequence-attribute";
import {Sequence} from "../../../lib/sequence";

import {expect} from "chai";

describe("SequenceAttribute", function() {
	it("creates an instance of SequenceAttribute", function() {
		const name = "email";
		const sequence = {} as Sequence;
		const result = new SequenceAttribute(name, false, sequence);

		expect(result).to.be.an.instanceof(SequenceAttribute);
		expect(result.name).to.equal(name);
		expect(result.sequence).to.equal(sequence);
	});

	describe("#evaluate", function() {
		it("returns a function that calls #next()", function() {
			const sequence = new Sequence("email", (n: number) => `Name ${n}`);
			const attribute = new SequenceAttribute("email", false, sequence);
			const result = attribute.evaluate();

			expect(result()).to.equal("Name 1");
			expect(result()).to.equal("Name 2");
		});
	});
});
