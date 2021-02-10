import {Assembler} from "../assembler";
import {Strategy} from "./strategy";
import {Pojo} from "../types";

export class AttributesForStrategy extends Strategy {
	async result<T>(assembler: Assembler<T>): Promise<Pojo> {
		return assembler.toObject();
	}

	async relation(fixtureName: string, traitsAndOverrides: any[]): Promise<any> {
		// TODO: Can we just return undefined here and remove the null strategy?
		return this.fixtureRiveter.run(fixtureName, "null", traitsAndOverrides);
	}
}
