import {optionsParser, numberGen, stringGen} from "../../lib/sequence";
import {expect} from "chai";

describe("optionsParser", function() {
	it("returns an empty object with no arguments", function() {
		const result = optionsParser();
		expect(result).to.deep.equal({});
	});

	it("sets initial when given a function returning a generator", function() {
		const initial = () => numberGen(1);
		const result = optionsParser(initial);

		expect(result).to.deep.equal({gen: initial});
	});

	it("sets aliases when given an object with aliases key", function() {
		const aliases = ["alias"];
		const result = optionsParser(aliases);

		expect(result).to.deep.equal({aliases});
	});

	it("doesn't set aliases when given an object with no aliases key", function() {
		const aliases = ["alias"];
		const result = optionsParser({key: aliases} as any);

		expect(result).to.deep.equal({});
	});

	it("sets callback when given a function", function() {
		const callback = (x: any) => x;
		const result = optionsParser(callback);

		expect(result).to.deep.equal({callback});
	});

	it("only sets the first instance of each option type", function() {
		const initial = () => stringGen("a");
		const initial2 = () => stringGen("b");
		const aliases = ["alias"];
		const aliases2 = ["alias2"];
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

		const result = optionsParser(...args);

		expect(result).to.deep.equal({gen: initial, aliases, callback});
	});
});
