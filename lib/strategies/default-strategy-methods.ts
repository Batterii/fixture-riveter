import {FixtureName, Pojo, Overrides} from "../types";

export interface AttributesForStrategyMethods {
	attributesFor<T = Pojo>(
		name: FixtureName<T>,
		traits?: string[],
		overrides?: Overrides<T>,
	): Promise<T>;

	attributesFor<T = Pojo>(
		name: FixtureName<T>,
		traitOrOverrides?: string[]|Overrides<T>,
	): Promise<T>;

	attributesForList<T = Pojo>(
		name: FixtureName<T>,
		count: number,
		traits?: string[],
		overrides?: Overrides<T>,
	): Promise<T[]>;

	attributesForList<T = Pojo>(
		name: FixtureName<T>,
		count: number,
		traitOrOverrides?: string[]|Overrides<T>,
	): Promise<T[]>;

	attributesForPair<T = Pojo>(
		name: FixtureName<T>,
		traits?: string[],
		overrides?: Overrides<T>,
	): Promise<[T, T]>;

	attributesForPair<T = Pojo>(
		name: FixtureName<T>,
		traitOrOverrides?: string[]|Overrides<T>,
	): Promise<[T, T]>;
}

export interface BuildStrategyMethods {
	build<T = Pojo>(
		name: FixtureName<T>,
		traitOrOverrides?: string[]|Overrides<T>,
	): Promise<T>;

	build<T = Pojo>(
		name: FixtureName<T>,
		traits?: string[],
		overrides?: Overrides<T>,
	): Promise<T>;

	buildPair<T = Pojo>(
		name: FixtureName<T>,
		traits?: string[],
		overrides?: Overrides<T>,
	): Promise<[T, T]>;

	buildPair<T = Pojo>(
		name: FixtureName<T>,
		traitOrOverrides?: string[]|Overrides<T>,
	): Promise<[T, T]>;

	buildList<T = Pojo>(
		name: FixtureName<T>,
		count: number,
		traits?: string[],
		overrides?: Overrides<T>,
	): Promise<T[]>;

	buildList<T = Pojo>(
		name: FixtureName<T>,
		count: number,
		traitOrOverrides?: string[]|Overrides<T>,
	): Promise<T[]>;
}

export interface CreateStrategyMethods {
	create<T = Pojo>(
		name: FixtureName<T>,
		traits?: string[],
		overrides?: Overrides<T>,
	): Promise<T>;

	create<T = Pojo>(
		name: FixtureName<T>,
		traitOrOverrides?: string[]|Overrides<T>,
	): Promise<T>;

	createList<T = Pojo>(
		name: FixtureName<T>,
		count: number,
		traits?: string[],
		overrides?: Overrides<T>,
	): Promise<T[]>;

	createList<T = Pojo>(
		name: FixtureName<T>,
		count: number,
		traitOrOverrides?: string[]|Overrides<T>,
	): Promise<T[]>;

	createPair<T = Pojo>(
		name: FixtureName<T>,
		traits?: string[],
		overrides?: Overrides<T>,
	): Promise<[T, T]>;

	createPair<T = Pojo>(
		name: FixtureName<T>,
		traitOrOverrides?: string[]|Overrides<T>,
	): Promise<[T, T]>;
}

export type DefaultStrategyMethods = (
	& AttributesForStrategyMethods
	& BuildStrategyMethods
	& CreateStrategyMethods
);
