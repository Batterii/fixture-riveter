import {Attribute} from "../attributes/attribute";
import {Declaration} from "../declarations/declaration";
import {Fixture} from "../fixture";
import {FixtureRiveter} from "../fixture-riveter";
import {RelationAttribute} from "../attributes/relation-attribute";
import {SequenceAttribute} from "../attributes/sequence-attribute";

export class ImplicitDeclaration<T> extends Declaration {
	fixtureRiveter: FixtureRiveter;
	fixture: Fixture<T>;

	constructor(
		name: string,
		ignored: boolean,
		fixtureRiveter: FixtureRiveter,
		fixture: Fixture<T>,
	) {
		super(name, ignored);
		this.fixtureRiveter = fixtureRiveter;
		this.fixture = fixture;
	}

	checkSelfReference(): boolean {
		return this.fixture.name === this.name;
	}

	build(): Attribute[] {
		const fixture = this.fixtureRiveter.getFixture(this.name, false);
		if (fixture !== undefined) {
			return [new RelationAttribute(this.name, this.name, [])];
		}
		const sequence = this.fixtureRiveter.findSequence(this.name);
		if (sequence !== undefined) {
			return [new SequenceAttribute(this.name, this.ignored, sequence)];
		}
		if (this.checkSelfReference()) {
			throw new Error(`Self-referencing trait '${this.name}'`);
		}
		this.fixture.inheritTraits([this.name]);
		return [];
	}
}
