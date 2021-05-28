import {Assembler} from "../assembler";
import {Strategy} from "./strategy";
import {Pojo} from "../types";

export class AttributesForStrategy extends Strategy {
	async result<T>(assembler: Assembler<T>): Promise<Pojo> {
		return assembler.toObject();
	}

	async relation(): Promise<any> {
		return null;
	}
}
