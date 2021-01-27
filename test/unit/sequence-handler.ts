import {Sequence} from "../../lib/sequences/sequence";
import {IntegerSequence} from "../../lib/sequences/integer-sequence";
import {StringSequence} from "../../lib/sequences/string-sequence";
import {SequenceHandler, optionsParser, sequenceChooser} from "../../lib/sequence-handler";

import {expect} from "chai";

describe("SequenceHandler", function() {
	it("can be created", function() {
		const seq = new SequenceHandler();

		expect(seq).to.be.an.instanceof(SequenceHandler);
	});

	it("is initialized with an empty list of sequences", function() {
		const seq = new SequenceHandler();

		expect(seq.sequences).to.be.empty;
	});

	describe("#registerSequence", function() {
		it("adds a new sequence to the internal list", function() {
			const seq = new SequenceHandler();
			const name = "email";
			seq.registerSequence(name);

			expect(Object.keys(seq.sequences)).to.deep.equal([name]);
			expect(seq.sequences[name]).to.be.an.instanceof(Sequence);
		});

		it("returns the new sequence", function() {
			const seq = new SequenceHandler();
			const name = "email";
			const result = seq.registerSequence(name);

			expect(result).to.be.an.instanceof(Sequence);
			expect(result.name).to.equal(name);
		});
	});

	describe("#resetSequences", function() {
		it("resets all sequences", function() {
			const sh = new SequenceHandler();
			const seq1: any = sh.registerSequence("email");
			const seq2: any = sh.registerSequence("password");
			seq1.next();
			seq2.next();
			seq1.next();
			seq2.next();
			sh.resetSequences();

			expect(seq1.index).to.equal(1);
			expect(seq2.index).to.equal(1);
		});
	});
});

describe("optionsParser", function() {
	it("returns an empty object with no arguments", function() {
		const result = optionsParser();
		expect(result).to.deep.equal({});
	});

	it("sets initial when given a number", function() {
		const initial = 1;
		const result = optionsParser(initial);

		expect(result).to.deep.equal({initial: 1});
	});

	it("sets initial when given a string", function() {
		const initial = "a";
		const result = optionsParser(initial);

		expect(result).to.deep.equal({initial: "a"});
	});

	it("sets aliases when given an object with aliases key", function() {
		const aliases = ["alias"];
		const result = optionsParser({aliases});

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

	it("accepts arguments in any order", function() {
		const initial = "a";
		const aliases = {aliases: ["alias"]};
		const callback = (x: any) => x;
		const args = [aliases, callback, initial];

		const result = optionsParser(...args);

		expect(result).to.deep.equal({initial, ...aliases, callback});
	});

	it("only sets the first instance of each option type", function() {
		const initial = "a";
		const initial2 = "b";
		const aliases = {aliases: ["alias"]};
		const aliases2 = {aliases: ["alias2"]};
		const callback = (x: any) => x;
		const callback2 = (x: any) => x.concat("c");
		const args = [initial, aliases, callback, initial2, aliases2, callback2];

		const result = optionsParser(...args);

		expect(result).to.deep.equal({initial, ...aliases, callback});
	});
});

describe("sequenceChooser", function() {
	it("returns an instance of IntegerSequence by default", function() {
		const name = "email";
		const result = sequenceChooser(name, {});

		expect(result).to.be.an.instanceof(IntegerSequence);
		expect(result.name).to.equal(name);
	});

	it("returns an instance of IntegerSequence if given a non-string", function() {
		const name = "email";
		const result = sequenceChooser(name, {initial: 1});

		expect(result).to.be.an.instanceof(IntegerSequence);
	});

	it("returns an instance of StringSequence if given a string", function() {
		const name = "email";
		const result = sequenceChooser(name, {initial: "a"});

		expect(result).to.be.an.instanceof(StringSequence);
		expect(result.name).to.equal(name);
	});

	it("passes given options into IntegerSequence constructor", function() {
		const name = "email";
		const initial = 5;
		const aliases = ["alias"];
		const callback = (x: number) => x + 1;
		const options = {initial, aliases, callback};

		const result = sequenceChooser(name, options) as IntegerSequence;

		expect(result.names()).to.deep.equal([name, ...aliases]);
		expect(result.initialNumber).to.equal(initial);
		expect(result.callback).to.equal(callback);
	});

	it("passes given options into StringSequence constructor", function() {
		const name = "email";
		const initial = "a";
		const aliases = ["alias"];
		const callback = (x: string) => x.concat("b");
		const options = {initial, aliases, callback};

		const result = sequenceChooser(name, options) as StringSequence;

		expect(result.names()).to.deep.equal([name, ...aliases]);
		expect(result.initialChar).to.equal("a");
		expect(result.callback).to.equal(callback);
	});
});
