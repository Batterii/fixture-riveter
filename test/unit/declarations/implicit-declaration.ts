import {DummyModel} from "../../support/dummy-model";
import {FixtureRiveter} from "../../../lib/fixture-riveter";
import {Fixture} from "../../../lib/fixture";
import {ImplicitDeclaration} from "../../../lib/declarations/implicit-declaration";
import {RelationAttribute} from "../../../lib/attributes/relation-attribute";
import {SequenceAttribute} from "../../../lib/attributes/sequence-attribute";

import {expect} from "chai";

describe("ImplicitDeclaration", function() {
	const name = "email";

	it("creates an instance of ImplicitDeclaration", function() {
		const fixtureRiveter = {} as FixtureRiveter;
		const fixture = {} as Fixture<any>;
		const result = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);

		expect(result).to.be.an.instanceof(ImplicitDeclaration);
		expect(result.name).to.equal(name);
		expect(result.fixtureRiveter).to.equal(fixtureRiveter);
		expect(result.fixture).to.equal(fixture);
	});

	describe("#checkSelfReference", function() {
		it("returns true if fixture and own name are the same", function() {
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "fixture", DummyModel);
			const declaration = new ImplicitDeclaration("fixture", false, fixtureRiveter, fixture);
			expect(declaration.checkSelfReference()).to.be.true;
		});

		it("returns false if fixture and own name are not the same", function() {
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "fixture", DummyModel);
			const declaration = new ImplicitDeclaration("decl", false, fixtureRiveter, fixture);
			expect(declaration.checkSelfReference()).to.be.false;
		});
	});

	describe("#build", function() {
		context("with a known relation", function() {
			it("returns a relation attribute", function() {
				const fixtureRiveter = new FixtureRiveter();
				fixtureRiveter.fixture(name, DummyModel);

				const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				const array = declaration.build();
				const [result] = array;

				expect(array).to.be.an.instanceof(Array);
				expect(array).to.have.length(1);
				expect(result).to.be.an.instanceof(RelationAttribute);
				expect(result.name).to.equal(name);
			});
		});

		context("with a known sequence", function() {
			it("returns a sequence attribute", function() {
				const fixtureRiveter = new FixtureRiveter();
				fixtureRiveter.sequence(name, (n: number) => `Name ${n}`);

				const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				const array = declaration.build();
				const [result] = array;

				expect(array).to.be.an.instanceof(Array);
				expect(array).to.have.length(1);
				expect(result).to.be.an.instanceof(SequenceAttribute);
				expect(result.name).to.equal(name);
			});
		});

		context("with no known sequences", function() {
			it("throws if checkSelfReference is true", function() {
				const fixtureRiveter = new FixtureRiveter();
				const fixture = new Fixture(fixtureRiveter, name, DummyModel);
				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				const fn = () => declaration.build();

				expect(fn).to.throw(`Self-referencing trait '${name}'`);
			});
		});

		context("when not self-referencing", function() {
			it("inherits the name as a trait", function() {
				const fixtureRiveter = new FixtureRiveter();
				const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				const result = declaration.build();
				expect(result).to.deep.equal([]);
				expect(declaration.fixture.baseTraits).to.deep.equal([name]);
			});
		});
	});
});
