import {DynamicDeclaration} from "../../lib/declarations/dynamic-declaration";
import {ImplicitDeclaration} from "../../lib/declarations/implicit-declaration";
import {DefinitionProxy} from "../../lib/definition-proxy";
import {Fixture} from "../../lib/fixture";
import {FixtureRiveter} from "../../lib/fixture-riveter";
import {Sequence} from "../../lib/sequences/sequence";

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

	it("creates an array for child factories", function() {
		const fixtureRiveter = new FixtureRiveter();
		const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
		const proxy = new DefinitionProxy(fixture);
		expect(proxy.childFactories).to.deep.equal([]);
	});

	describe("#execute", function() {
		it("calls the definition's block", function() {
			let result: any;
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel, function() {
				result = 1;
			});
			const proxy = new DefinitionProxy(fixture);
			proxy.execute();

			expect(result).to.equal(1);
		});

		it("doesn't call the definition's block when no block is given", function() {
			let result: any;
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
			const proxy = new DefinitionProxy(fixture);
			proxy.execute();

			expect(result).to.be.undefined;
		});
	});

	describe("#attr", function() {
		context("when given no block", function() {
			it("calls declareAttribute with an ImplicitDeclaration", function() {
				const fixtureRiveter = new FixtureRiveter();
				const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
				const proxy = new DefinitionProxy(fixture);
				const name = "email";
				sinon.spy(fixture, "declareAttribute");
				proxy.attr(name);

				expect(fixture.declareAttribute).to.be.calledOnce;
				expect(
					fixture.declarationHandler.declarations[0],
				).to.be.an.instanceof(ImplicitDeclaration);
			});
		});

		context("when given a Function block", function() {
			it("calls declareAttribute with a DynamicDeclaration", function() {
				const fixtureRiveter = new FixtureRiveter();
				const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
				const proxy = new DefinitionProxy(fixture);
				const name = "email";
				const block = () => 1;
				sinon.spy(fixture, "declareAttribute");
				proxy.attr(name, block);

				expect(fixture.declareAttribute).to.be.calledOnce;
				expect(
					fixture.declarationHandler.declarations[0],
				).to.be.an.instanceof(DynamicDeclaration);
			});
		});
	});

	describe("#fixture", function() {
		it("saves fixture details as children", function() {
			const fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
			const proxy = new DefinitionProxy(fixture);
			proxy.fixture("newFixture", DummyModel);

			expect(proxy.childFactories).to.deep.equal([["newFixture", DummyModel]]);
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
		context("when given a block function", function() {
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

		context("when given no block", function() {
			it("throws an error", function() {
				const fixtureRiveter = new FixtureRiveter();
				const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
				const proxy = new DefinitionProxy(fixture);
				const name = "email";
				const fn = () => proxy.trait(name);

				expect(fn).to.throw("wrong options");
			});
		});
	});
});
