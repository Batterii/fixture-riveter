import {Attribute} from './attribute';

export class NullFactory {
	name: string;
	attributes: Attribute[];

	constructor() {
		this.name = 'nullFactory';
		this.attributes = [];
	}

	// eslint-disable-next-line class-methods-use-this
	compile(): void {
		// empty function
	}
}
