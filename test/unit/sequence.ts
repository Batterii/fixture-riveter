import sinon from "sinon";
import {Sequence, optionsParser, numberGen, stringGen} from "../../lib/sequence";
import {capitalize} from "lodash";
import {expect} from "chai";

describe("Sequence", function() {
	describe("constructor", function() {
		function *g() {
			while (true) {
				yield "X";
			}
		}

		specify("1 arg", function() {
			const seq = new Sequence("name");
			expect(seq.name).to.equal("name");
			expect(seq.baseGenerator).to.be.an.instanceOf(Function);
			expect(seq.generator).to.be.an.instanceOf(Object);
			expect(seq.generator.next).to.be.an.instanceOf(Function);
			expect(seq.value).to.equal(1);
			expect(seq.initialValue).to.equal(1);
		});

		specify("2 args", function() {
			expect(new Sequence("name1", "a")).to.exist;
			expect(new Sequence("name2", 1)).to.exist;
			expect(new Sequence("name3", {aliases: ["alias3"]})).to.exist;
			expect(new Sequence("name4", (x) => `4result${x}`)).to.exist;
			expect(new Sequence("name5", g)).to.exist;
		});

		specify("3 args", function() {
			expect(new Sequence("name1", "a", {aliases: ["alias1"]})).to.exist;
			expect(new Sequence("name2", "a", (x) => `2result${x}`)).to.exist;
			expect(new Sequence("name3", 1, {aliases: ["alias3"]})).to.exist;
			expect(new Sequence("name4", 1, (x) => `4result${x}`)).to.exist;
			expect(new Sequence("name5", g, {aliases: ["alias5"]})).to.exist;
			expect(new Sequence("name6", g, (x) => `6result${x}`)).to.exist;
			expect(new Sequence("name7", {aliases: ["alias7"]}, (x) => `7result${x}`)).to.exist;
		});

		specify("4 args", function() {
			expect(new Sequence("name1", "a", {aliases: ["alias1"]}, (x) => {
				return `1result${x}`;
			})).to.exist;
			expect(new Sequence("name2", 1, {aliases: ["alias2"]}, (x) => `2result${x}`)).to.exist;
			expect(new Sequence("name3", g, {aliases: ["alias3"]}, (x) => `3result${x}`)).to.exist;
		});

		it("throws up if the generator needs an argument to work", function() {
			function *brokenGenerator(input: number) {
				while (true) {
					yield input.toString();
				}
			}

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			expect(() => new Sequence("broken", brokenGenerator)).to.throw;
		});
	});

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
	it("returns an empty object with no arguments", function() {
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

		expect(() => optionsParser("name", ...args)).to.throw;
	});
});
