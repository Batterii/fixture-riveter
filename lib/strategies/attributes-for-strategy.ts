import {Assembler} from "../assembler";
import {Strategy} from "./strategy";
import {Pojo} from "../types";

export class AttributesForStrategy extends Strategy {
	async association(fixtureName: string, traitsAndOverrides: any[]): Promise<any> {
		return this.fixtureRiveter.run(fixtureName, "null", traitsAndOverrides);
	}

	async result<T>(assembler: Assembler<T>): Promise<Pojo> {
		return assembler.toObject();
	}
}
