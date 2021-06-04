// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import sinon from "sinon";
import {Sequence, optionsParser, numberGen, stringGen} from "../../lib/sequence";
import {capitalize} from "lodash";
import {expect} from "chai";

describe("Sequence", function() {
	describe("names", function() {
		it("returns a list", function() {
			const seq = new Sequence("name");
			expect(seq.names()).to.be.an.instanceOf(Array);
		});

		it("returns given name by default", function() {
			const seq = new Sequence("name");
			expect(seq.names()).to.deep.equal(["name"]);
		});

		it("returns all aliases after given name in order defined", function() {
			const seq = new Sequence("name");
			seq.aliases = ["1", "2", "3"];
			expect(seq.names()).to.deep.equal(["name", "1", "2", "3"]);
		});
	});

	describe("next", function() {
		it("returns the current value", function() {
			const seq = new Sequence("name");
			seq.value = "hello";
			const result = seq.next();
			expect(result).to.equal("hello");
		});

		it("calls the callback on the current value", function() {
			const seq = new Sequence("name");
			seq.value = "hello";
			seq.callback = (x: string) => capitalize(x);
			const result = seq.next();
			expect(result).to.equal("Hello");
		});

		it("changes value to be the generator's next value", function() {
			const seq = new Sequence("name");
			seq.generator = {next: () => ({value: "x"})} as any;
			seq.next();
			expect(seq.value).to.equal("x");
		});
	});

	describe("reset", function() {
		it("calls baseGenerator to set generator", function() {
			const seq = new Sequence("name");
			seq.generator = "generator" as any;
			seq.baseGenerator = () => "base" as any;
			seq.reset();
			expect(seq.generator).to.equal("base");
		});

		it("sets value to initialValue", function() {
			const seq = new Sequence("name");
			seq.value = "value";
			seq.initialValue = "init";
			seq.reset();
			expect(seq.value).to.equal("init");
		});
	});

	describe("iterator", function() {
		it("implements the iteration protocol", function() {
			const seq = new Sequence("name");
			const results: number[] = [];
			for (const i of seq) {
				results.push(i);
				if (results.length >= 5) {
					break;
				}
			}
			expect(results).to.deep.equal([1, 2, 3, 4, 5]);
		});
	});
});

describe("optionsParser", function() {
	it("returns an object with defaults", function() {
		const result = optionsParser("name");
		sinon.assert.match(result, {
			aliases: [],
			baseGenerator: sinon.match.func,
			callback: sinon.match.func,
			initial: 1,
		});
	});

	it("sets initial when given a function returning a generator", function() {
		const initial = () => numberGen(1);
		const result = optionsParser("name", initial);
		sinon.assert.match(result, {
			aliases: [],
			baseGenerator: sinon.match.func,
			callback: sinon.match.func,
			initial: sinon.match(initial),
		});
	});

	it("sets aliases when given an object with aliases key", function() {
		const aliases = ["alias"];
		const result = optionsParser("name", {aliases});

		sinon.assert.match(result, {
			aliases: sinon.match(aliases),
			baseGenerator: sinon.match.func,
			callback: sinon.match.func,
			initial: 1,
		});
	});

	it("sets callback when given a function", function() {
		const callback = (x: any) => x;
		const result = optionsParser("name", callback);

		sinon.assert.match(result, {
			aliases: [],
			baseGenerator: sinon.match.func,
			callback: sinon.match(callback),
			initial: 1,
		});
	});

	it("only sets the first instance of each option type", function() {
		const initial = () => stringGen("a");
		const initial2 = () => stringGen("b");
		const aliases = {aliases: ["alias"]};
		const aliases2 = {aliases: ["alias2"]};
		const callback = (x: any) => x;
		const callback2 = (x: any) => x.concat("c");
		const args = [
			initial,
			aliases,
			callback,
			initial2,
			aliases2,
			callback2,
		];

		expect(() => optionsParser("name", ...args)).to.throw(
			"Incorrect options for sequence \"name\"",
		);
	});

	describe("options in a map", function() {
		function *gen() {
			while (true) {
				yield "X";
			}
		}

		it("accepts aliases", function() {
			const options = optionsParser("name", {aliases: ["alias"]});
			sinon.assert.match(options, {
				aliases: ["alias"],
				baseGenerator: sinon.match.func,
				callback: sinon.match.func,
				initial: 1,
			});
		});

		it("throws if given an array of non-strings", function() {
			const options = () => optionsParser("name", {aliases: ["alias", 1]});
			expect(options).to.throw("Can't use non-string aliases for sequence \"name\"");
		});

		it("accepts callback", function() {
			const callback = (x: any) => x * 2;
			const options = optionsParser("name", {callback});
			sinon.assert.match(options, {
				aliases: sinon.match([]),
				baseGenerator: sinon.match.func,
				callback,
				initial: 1,
			});
			expect(options.callback(4)).to.equal(8);
		});

		it("throws if given two callbacks", function() {
			const callback = (x: any) => x * 2;
			const options = () => optionsParser("name", {callback}, callback);
			expect(options).to.throw("Can't define two callbacks for sequence \"name\"");
		});

		it("accepts numeric initial", function() {
			const options = optionsParser("name", {initial: 10});
			sinon.assert.match(options, {
				aliases: sinon.match([]),
				baseGenerator: sinon.match.func,
				callback: sinon.match.func,
				initial: 10,
			});
			expect(options.baseGenerator().next().value).to.equal(11);
		});

		it("accepts string initial", function() {
			const options = optionsParser("name", {initial: "aaa"});
			sinon.assert.match(options, {
				aliases: sinon.match([]),
				baseGenerator: sinon.match.func,
				callback: sinon.match.func,
				initial: "aaa",
			});
			expect(options.baseGenerator().next().value).to.equal("aab");
		});

		it("throws an error when passed an implement and explicit initial", function() {
			const options = () => optionsParser("name", 10, {initial: 10});
			expect(options).to.throw("Can't define two initial values for sequence \"name\"");
		});

		it("accepts gen", function() {
			const options = optionsParser("name", {gen});
			sinon.assert.match(options, {
				aliases: sinon.match([]),
				baseGenerator: gen,
				callback: sinon.match.func,
				initial: "X",
			});
			expect(options.baseGenerator().next().value).to.equal("X");
		});

		it("throws an error when passed both a implicit and explicit gen", function() {
			const options = () => optionsParser("name", () => gen(), {gen});
			expect(options).to.throw("Can't define two generator functions for sequence \"name\"");
		});

		it("throws when given both initial and gen", function() {
			const options = () => optionsParser("name", {initial: 10, gen, aliases: ["a"]});
			expect(options).to.throw(
				"Can't provide both initial value and generator function for sequence \"name\"",
			);
		});
	});
});

describe("numberGen", function() {
	it("returns the succ of input", function() {
		const gen = numberGen(1);
		expect(gen.next().value).to.equal(2);
		expect(gen.next().value).to.equal(3);
	});

	it("throws if given a string", function() {
		const gen = (numberGen as any)("1");
		expect(() => gen.next()).to.throw("numberGen requires a number");
	});
});

describe("stringGen", function() {
	it("returns the succ of input", function() {
		const gen = stringGen("a");
		expect(gen.next().value).to.equal("b");
		expect(gen.next().value).to.equal("c");
	});

	it("throws if given a string", function() {
		const gen = (stringGen as any)(1);
		expect(() => gen.next()).to.throw("stringGen requires a string");
	});

	it("handles rollover", function() {
		const gen = stringGen("z");
		expect(gen.next().value).to.equal("aa");
		expect(gen.next().value).to.equal("ab");
	});

	it("handles uppercase strings", function() {
		const gen = stringGen("Z");
		expect(gen.next().value).to.equal("AA");
		expect(gen.next().value).to.equal("AB");
	});

	it("handles mixed case strings", function() {
		const gen = stringGen("Zz");
		expect(gen.next().value).to.equal("AAa");
		expect(gen.next().value).to.equal("AAb");
	});

	it("handles numbers", function() {
		const gen = stringGen("1");
		expect(gen.next().value).to.equal("2");
		expect(gen.next().value).to.equal("3");
	});

	it("handles number rollver", function() {
		const gen = stringGen("9");
		expect(gen.next().value).to.equal("10");
		expect(gen.next().value).to.equal("11");
	});

	it("skips non-alphanumeric characters", function() {
		const gen = stringGen("<<abc>>");
		expect(gen.next().value).to.equal("<<abd>>");
		expect(gen.next().value).to.equal("<<abe>>");
	});

	it("handles mixed alphabetic and numeric strings", function() {
		const gen1 = stringGen("1999zzz");
		expect(gen1.next().value).to.equal("2000aaa");
		expect(gen1.next().value).to.equal("2000aab");

		const gen2 = stringGen("ZZZ9999");
		expect(gen2.next().value).to.equal("AAAA0000");
		expect(gen2.next().value).to.equal("AAAA0001");
	});

	it("handles empty strings", function() {
		const gen = stringGen("");
		expect(gen.next().value).to.equal("a");
		expect(gen.next().value).to.equal("b");
	});
});
