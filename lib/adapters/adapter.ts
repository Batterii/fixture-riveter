import {Evaluator} from "../evaluator";

export interface Adapter {
	build<T>(Model: any, evaluator?: Evaluator): T|Promise<T>;
	save<T>(instance: T, Model?: any): Promise<T>;
	destroy<T>(instance: T, Model?: any): Promise<void>;
	relate<T>(instance: T, name: string, other: any, Model?: any): T|Promise<T>;
	set<T>(instance: T, key: string, value: any): T|Promise<T>;
}
