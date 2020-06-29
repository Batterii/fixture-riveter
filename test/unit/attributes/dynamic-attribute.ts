import {DynamicAttribute} from "../../../lib/attributes/dynamic-attribute";

import {identity} from "lodash";
import {expect} from "chai";

describe("DynamicAttribute", function() {
	it("creates an instance of DynamicAttribute", function() {
		const name = "email";
		const result = new DynamicAttribute(name, false, identity);

		expect(result).to.be.an.instanceof(DynamicAttribute);
		expect(result.name).to.equal(name);
		expect(result.block).to.equal(identity);
	});

	describe("#evaluate", function() {
		it("returns a function that calls the block", function() {
			const attribute = new DynamicAttribute("email", false, () => 1);
			const result = attribute.evaluate();

			expect(result()).to.equal(1);
		});

		it("calls the block on the given argument", function() {
			const name = "email";
			const attribute = new DynamicAttribute(name, false, (t: any) => t.age);
			const context = {age: 33};
			const result = attribute.evaluate();

			expect(result(context as any)).to.equal(33);
		});

		it("calls the block with the right context", function() {
			const name = "email";
			const attribute = new DynamicAttribute(name, false, function() {
				// eslint-disable-next-line no-invalid-this
				return this.age;
			});
			const context = {age: 33};
			const result = attribute.evaluate();

			expect(result(context as any)).to.equal(33);
		});
	});
});
