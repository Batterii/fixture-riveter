import {Definition} from "./definition";
import {DefinitionProxy} from "./definition-proxy";
import {FactoryBuilder} from "./factory-builder";
import {blockFunction} from "./factory-options-parser";

/* eslint-disable class-methods-use-this */
export class Trait extends Definition {
	constructor(
		name: string,
		factoryBuilder: FactoryBuilder,
		block?: blockFunction,
	) {
		super(name, factoryBuilder);

		if (block) {
			this.block = block;
		}

		const proxy = new DefinitionProxy(this);
		proxy.execute();
	}
}
