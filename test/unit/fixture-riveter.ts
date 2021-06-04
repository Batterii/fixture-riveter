// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {DummyModel} from "../support/dummy-model";
import {Model} from "../support/model";

import {Fixture} from "../../lib/fixture";
import {extractOverrides, nameGuard, FixtureRiveter} from "../../lib/fixture-riveter";
import {Sequence} from "../../lib/sequence";

import {identity} from "lodash";
import {expect} from "chai";
import sinon from "sinon";

describe("extractAttributes", function() {
	it("returns an empty object", function() {
		const array = [1, 2, 3];
		const result = extractOverrides(array);
		expect(array).to.deep.equal([1, 2, 3]);
		expect(result).to.deep.equal({});
	});

	it("returns the array at the end", function() {
		const array = [1, 2, 3, {parent: "parent"}];
		const result = extractOverrides(array);
		expect(array).to.deep.equal([1, 2, 3]);
		expect(result).to.deep.equal({parent: "parent"});
	});
});

describe("nameGuard", function() {
	it("accepts strings", function() {
		expect(nameGuard("name")).to.equal("name");
	});

	it("accepts ObjectionModels", function() {
		// eslint-disable-next-line @typescript-eslint/no-extraneous-class
		class User extends Model {}
		expect(nameGuard(User)).to.equal(User.tableName);
	});

	it("accepts classes", function() {
		expect(nameGuard(DummyModel)).to.equal(DummyModel.name);
	});

	it("throws if given anything else", function() {
		expect(() => nameGuard({} as any)).to.throw("[object Object] isn't the right shape");
	});
});

describe("FixtureRiveter", function() {
	let fixtureRiveter: FixtureRiveter;

	beforeEach(function() {
		fixtureRiveter = new FixtureRiveter();
	});

	it("can be built", function() {
		expect(fixtureRiveter).to.exist;
		expect(fixtureRiveter.fixtures).to.exist.and.to.be.empty;
	});

	it("#getAdapter");
	it("#setAdapter");
	it("#define");

	describe("#registerFixture", function() {
		it("adds the fixture by name", function() {
			const name = "testFixture";
			const fixture = new Fixture(fixtureRiveter, name, DummyModel);
			fixtureRiveter.registerFixture(fixture);
			expect(fixtureRiveter.fixtures.get(name)).to.equal(fixture);
		});

		it("adds the fixture by alias", function() {
			const name = "testFixture";
			const aliases = ["fixture1", "fixture2"];
			const fixture = new Fixture(fixtureRiveter, name, DummyModel, {aliases});
			fixtureRiveter.registerFixture(fixture);
			expect(fixtureRiveter.fixtures.get("fixture1")).to.equal(fixture);
			expect(fixtureRiveter.fixtures.get("fixture2")).to.equal(fixture);
		});

		it("adds the same fixture multiples times", function() {
			const name = "fixture1";
			const alias = "fixture2";
			const fixture = new Fixture(fixtureRiveter, name, DummyModel, {aliases: [alias]});
			fixtureRiveter.registerFixture(fixture);
			const {fixtures} = fixtureRiveter;
			expect(fixtures[name]).to.deep.equal(fixtures[alias]);
		});

		it("throws if trying to register the same name twice", function() {
			const name = "fixture1";
			const fixture1 = new Fixture(fixtureRiveter, name, DummyModel);
			const fixture2 = new Fixture(fixtureRiveter, name, DummyModel);
			fixtureRiveter.registerFixture(fixture1);
			expect(() => fixtureRiveter.registerFixture(fixture2)).to.throw(
				"Can't define fixture1 fixture twice",
			);
		});
	});

	describe("#fixture", function() {
		it("creates a fixture", function() {
			const name = "testFixture";
			fixtureRiveter.fixture(name, DummyModel);

			const fixture = fixtureRiveter.fixtures.get(name);

			expect(fixtureRiveter.fixtures).to.not.be.empty;
			expect(fixture).to.exist;
			expect(fixture!.name).to.equal(name);
		});

		it("returns the created fixture", function() {
			const name = "testFixture";
			const fixture = fixtureRiveter.fixture(name, DummyModel);

			expect(fixture.name).to.equal(name);
		});

		it("passes the options down to the fixture", function() {
			const name = "testFixture";
			const aliases = ["fixture1", "fixture2"];
			const fixture = fixtureRiveter.fixture(name, DummyModel, {aliases});

			expect(fixture.aliases).to.deep.equal(aliases);
		});

		it("registers the fixture", function() {
			const name = "testFixture";
			expect(fixtureRiveter.fixtures.get(name)).to.not.exist;
			fixtureRiveter.fixture("testFixture", DummyModel);
			expect(fixtureRiveter.fixtures.get(name)).to.exist;
		});

		it("doesn't register a fixture twice", function() {
			const testFn = () => {
				fixtureRiveter.fixture("testFixture", DummyModel);
			};
			testFn();
			expect(testFn).to.throw("testFixture is already defined");
		});

		it("creates child fixtures", function() {
			fixtureRiveter.fixture("user", DummyModel, (f) => {
				f.fixture("oldUser");
			});
			const result = Array.from(fixtureRiveter.fixtures.keys())
				.map((name: string) => fixtureRiveter.fixtures.get(name) as any)
				.map((f) => f.name);
			expect(result).to.deep.equal(["user", "oldUser"]);
		});
	});

	describe("#getFixture", function() {
		it("returns the requested fixture", function() {
			const name = "name";
			fixtureRiveter.fixture(name, DummyModel);
			const t = fixtureRiveter.getFixture(name);
			const result = fixtureRiveter.fixtures.get(name);
			expect(t).to.equal(result);
		});

		it("throws if a non-existant fixture is requested", function() {
			fixtureRiveter.fixture("t", DummyModel);
			expect(() => fixtureRiveter.getFixture("f")).to.throw();
		});
	});

	describe("#sequence", function() {
		it("returns the created sequence", function() {
			const fr = new FixtureRiveter();
			const result = fr.sequence("email");
			expect(result).to.be.an.instanceof(Sequence);
		});

		it("adds the sequence as an attribute", function() {
			const fr = new FixtureRiveter();
			const name = "email";
			fr.sequence(name);
			expect(Array.from(fr.sequenceHandler.sequences.keys())).to.deep.equal([name]);
			expect(fr.sequenceHandler.sequences.get(name)).to.be.an.instanceof(Sequence);
		});
	});

	describe("#findSequence", function() {
		it("returns the sequence for that name", function() {
			const fr = new FixtureRiveter();
			const name = "email";
			const sequence = fr.sequence(name);
			expect(fr.findSequence(name)).to.equal(sequence);
		});

		it("returns undefined when sequence doesn't exist", function() {
			const fr = new FixtureRiveter();
			expect(fr.findSequence("name")).to.be.undefined;
		});
	});

	describe("#generate", function() {
		it("returns the sequence for that name", function() {
			const fr = new FixtureRiveter();
			const name = "email";
			fr.sequence(name);
			expect(fr.generate(name)).to.equal(1);
		});

		it("returns undefined when sequence doesn't exist", function() {
			const fr = new FixtureRiveter();
			expect(fr.generate("name")).to.be.undefined;
		});
	});

	describe("#resetSequences", function() {
		it("resets all sequences", function() {
			const name = "user";
			const fr = new FixtureRiveter();
			function *g() {
				while (true) {
					yield "a";
				}
			}
			let sequenceInFixture = new Sequence("temp", g, () => 1);
			fr.fixture(name, DummyModel, (f) => {
				sequenceInFixture = f.sequence("email");
			});
			const globalSeq = fr.sequence("usernames");
			globalSeq.next();
			globalSeq.next();
			sequenceInFixture.next();
			sequenceInFixture.next();
			fr.resetSequences();
			expect(globalSeq.value).to.equal(1);
			expect(sequenceInFixture.value).to.equal(1);
		});
	});

	describe("#trait", function() {
		it("passes both arguments through to Trait", function() {
			const fr = new FixtureRiveter();
			const name = "email";
			const block = identity;
			fr.trait(name, block);
			const result = fr.traits.get(name) as any;

			expect(result.name).to.equal(name);
			expect(result.block).to.equal(block);
		});
	});

	describe("#getTrait", function() {
		it("returns the requested trait", function() {
			const name = "name";
			fixtureRiveter.trait(name, identity);
			const t = fixtureRiveter.getTrait(name);
			const result = fixtureRiveter.traits.get(name);
			expect(t).to.equal(result);
		});

		it("throws if a non-existant trait is requested", function() {
			fixtureRiveter.trait("t", identity);
			expect(() => fixtureRiveter.getTrait("f")).to.throw("Trait f hasn't been defined yet");
		});
	});

	describe("#run", function() {
		it("throws if fixture hasn't been defined yet", async function() {
			return expect(
				Promise.resolve(fixtureRiveter.run("test", "build")),
			).to.eventually.be.rejectedWith("Fixture test hasn't been defined");
		});

		it("throws if strategy hasn't been defined", async function() {
			const name = "testFixture";
			const fixture = new Fixture(fixtureRiveter, name, DummyModel);
			fixtureRiveter.registerFixture(fixture);
			return expect(
				Promise.resolve(fixtureRiveter.run(name, "test")),
			).to.eventually.be.rejectedWith("Strategy test hasn't been defined");
		});
	});

	describe("#before", function() {
		it("passes the call to the callback handler", function() {
			const name = "name";
			const callback = (): any => true;
			const before = sinon.spy(fixtureRiveter.callbackHandler, "before");
			fixtureRiveter.before(name, callback);
			expect(before).to.be.calledWith(name, callback);
		});
	});

	describe("#after", function() {
		it("passes the call to the callback handler", function() {
			const name = "name";
			const callback = (): any => true;
			const after = sinon.spy(fixtureRiveter.callbackHandler, "after");
			fixtureRiveter.after(name, callback);
			expect(after).to.be.calledWith(name, callback);
		});
	});

	describe("#registerHook", function() {
		it("passes the call to the callback handler", function() {
			const name = ["name"];
			const callback = (): any => true;
			const registerHook = sinon.spy(fixtureRiveter.callbackHandler, "registerHook");
			fixtureRiveter.registerHook(name, callback);
			expect(registerHook).to.be.calledWith(name, callback);
		});
	});

	describe("#getHooks", function() {
		it("returns the callbackHandler's callbacks", function() {
			const callbacks = [];
			fixtureRiveter.callbackHandler.hooks = callbacks;
			expect(fixtureRiveter.getHooks()).to.equal(callbacks);
		});
	});
});
