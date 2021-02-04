import {DynamicDeclaration} from "../../lib/declarations/dynamic-declaration";
import {ImplicitDeclaration} from "../../lib/declarations/implicit-declaration";
import {DefinitionProxy} from "../../lib/definition-proxy";
import {Fixture} from "../../lib/fixture";
import {FixtureRiveter} from "../../lib/fixture-riveter";
import {Sequence} from "../../lib/sequence";
import {RelationDeclaration} from "../../lib/declarations/relation-declaration";

import {DummyModel} from "../test-fixtures/dummy-model";

import {expect} from "chai";
import sinon from "sinon";

describe("DefinitionProxy", function() {
	it("can be created", function() {
		const fixtureRiveter = new FixtureRiveter();
		const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
		const proxy = new DefinitionProxy(fixture);
		expect(proxy).to.be.an.instanceof(DefinitionProxy);
	});

	it("tracks the given definition object", function() {
		const fixtureRiveter = new FixtureRiveter();
		const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
		const proxy = new DefinitionProxy(fixture);
		expect(proxy.definition).to.equal(fixture);
	});

	it("creates an array for child fixtures", function() {
		const fixtureRiveter = new FixtureRiveter();
		const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
		const proxy = new DefinitionProxy(fixture);
		expect(proxy.childFixtures).to.deep.equal([]);
	});

	describe("#execute", function() {
		it("calls the definition's block", function() {
			let result = 0;
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel, function() {
				result = 1;
			});
			const proxy = new DefinitionProxy(fixture);
			proxy.execute();

			expect(result).to.equal(1);
		});
	});

	describe("#attr", function() {
		context("when given multiple args", function() {
			context("and the last arg is a function", function() {
				it("creates a DynamicDeclaration", function() {
					const fixtureRiveter = new FixtureRiveter();
					const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
					const proxy = new DefinitionProxy(fixture);
					const block = () => 1;
					proxy.attr("name", block);
					const decl = fixture.declarationHandler.declarations[0] as any;
					expect(decl).to.be.an.instanceof(DynamicDeclaration);
				});

				it("sets ignore to the same value", function() {
					const fixtureRiveter = new FixtureRiveter();
					const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
					const proxy = new DefinitionProxy(fixture);
					proxy.ignore = 100 as any;
					const block = () => 1;
					proxy.attr("name", block);
					const decl = fixture.declarationHandler.declarations[0] as any;
					expect(decl.ignored).to.equal(proxy.ignore);
					expect(decl.block).to.equal(block);
				});
			});

			context("and the last arg isn't a function", function() {
				it("creates a RelationDeclaration", function() {
					const fixtureRiveter = new FixtureRiveter();
					const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
					const proxy = new DefinitionProxy(fixture);
					proxy.attr("name", ["trait"]);
					const decl = fixture.declarationHandler.declarations[0] as any;
					expect(decl).to.be.an.instanceof(RelationDeclaration);
				});

				it("sets the traits", function() {
					const fixtureRiveter = new FixtureRiveter();
					const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
					const proxy = new DefinitionProxy(fixture);
					const traits = ["trait"];
					proxy.attr("name", traits);
					const decl = fixture.declarationHandler.declarations[0] as any;
					expect(decl.traits).to.deep.equal(traits);
				});
			});
		});

		context("when given only one arg", function() {
			it("creates an ImplicitDeclaration", function() {
				const fixtureRiveter = new FixtureRiveter();
				const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
				const proxy = new DefinitionProxy(fixture);
				proxy.attr("name");
				const decl = fixture.declarationHandler.declarations[0] as any;
				expect(decl).to.be.an.instanceof(ImplicitDeclaration);
			});

			it("sets internal values correctly", function() {
				const fixtureRiveter = new FixtureRiveter();
				const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
				const proxy = new DefinitionProxy(fixture);
				proxy.ignore = 100 as any;
				proxy.attr("name");
				const decl = fixture.declarationHandler.declarations[0] as any;
				expect(decl.ignored).to.equal(proxy.ignore);
				expect(decl.fixture).to.equal(fixture);
				expect(decl.fixtureRiveter).to.equal(fixtureRiveter);
			});
		});
	});

	describe("#fixture", function() {
		it("saves fixture details as children", function() {
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
			const proxy = new DefinitionProxy(fixture);
			proxy.fixture("newFixture", DummyModel);

			expect(proxy.childFixtures).to.deep.equal([["newFixture", DummyModel]]);
		});

		it("can accept a variable number of arguments", function() {
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
			const proxy = new DefinitionProxy(fixture);
			const options = {};
			const block = () => 1;
			proxy.fixture("newFixture", DummyModel, options, block);

			expect(proxy.childFixtures).to.deep.equal([["newFixture", DummyModel, options, block]]);
		});
	});

	describe("#sequence", function() {
		it("returns the created sequence", function() {
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
			const proxy = new DefinitionProxy(fixture);
			const result = proxy.sequence("email");
			expect(result).to.be.an.instanceof(Sequence);
		});

		it("adds the sequence as an attribute", function() {
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
			const proxy = new DefinitionProxy(fixture);
			sinon.spy(fixture, "declareAttribute");
			const name = "email";
			const result = proxy.sequence(name);
			const {declarations} = fixture.declarationHandler;

			expect(declarations).to.be.length(1);
			expect(declarations[0].name).to.equal(name);
			expect(fixture.declareAttribute).to.be.calledOnce;
			expect(declarations[0].name).to.equal(result.name);
		});

		it("delegates sequence creation to sequenceHandler", function() {
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
			const proxy = new DefinitionProxy(fixture);
			sinon.stub(fixture.sequenceHandler, "registerSequence");
			const name = "email";
			proxy.sequence(name);

			expect(fixture.sequenceHandler.registerSequence).to.be.calledOnce;
			expect(fixture.sequenceHandler.registerSequence).to.be.calledOnceWithExactly(name);
		});
	});

	describe("#trait", function() {
		it("calls defineTrait", function() {
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
			const proxy = new DefinitionProxy(fixture);
			sinon.stub(fixture, "defineTrait");
			const name = "email";
			const block = () => 1;
			proxy.trait(name, block);

			expect(fixture.defineTrait).to.be.calledOnce;
		});
	});
});
