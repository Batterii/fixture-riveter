import {DynamicAttribute} from "../../../lib/attributes/dynamic-attribute";
import {DynamicDeclaration} from "../../../lib/declarations/dynamic-declaration";

import {identity} from "lodash";
import {expect} from "chai";

describe("DynamicDeclaration", function() {
	it("creates an instance of DynamicDeclaration", function() {
		const name = "email";
		const result = new DynamicDeclaration(name, false, identity);

		expect(result).to.be.an.instanceof(DynamicDeclaration);
		expect(result.name).to.equal(name);
		expect(result.block).to.equal(identity);
	});

	describe("#build", function() {
		it("returns a list", function() {
			const name = "email";
			const declaration = new DynamicDeclaration(name, false, identity);
			const result = declaration.build();

			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(1);
		});

		it("returns a list with a new DynamicAttribute", function() {
			const name = "email";
			const declaration = new DynamicDeclaration(name, false, identity);
			const [result] = declaration.build();

			expect(result).to.be.an.instanceof(DynamicAttribute);
			expect(result.name).to.equal(name);
			expect(result.block).to.equal(identity);
		});
	});
});
