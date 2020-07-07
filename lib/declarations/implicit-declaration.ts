import {Attribute} from "../attributes/attribute";
import {Declaration} from "../declarations/declaration";
import {Fixture} from "../fixture";
import {FixtureRiveter} from "../fixture-riveter";
import {AssociationAttribute} from "../attributes/association-attribute";
import {SequenceAttribute} from "../attributes/sequence-attribute";

export class ImplicitDeclaration extends Declaration {
	fixtureRiveter: FixtureRiveter;
	fixture: Fixture;

	constructor(
		name: string,
		ignored: boolean,
		fixtureRiveter: FixtureRiveter,
		fixture: Fixture,
	) {
		super(name, ignored);
		this.fixtureRiveter = fixtureRiveter;
		this.fixture = fixture;
	}

	checkSelfReference(): boolean {
		return this.fixture.name === this.name;
	}

	build(): Attribute[] {
		if (this.fixtureRiveter.getFixture(this.name, false)) {
			return [new AssociationAttribute(this.name, this.name, [])];
		}
		const sequence = this.fixtureRiveter.findSequence(this.name);
		if (sequence) {
			return [new SequenceAttribute(this.name, this.ignored, sequence)];
		}
		if (this.checkSelfReference()) {
			throw new Error(`Self-referencing trait '${this.name}'`);
		}
		this.fixture.inheritTraits([this.name]);
		return [];
	}
}
