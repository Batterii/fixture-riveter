declare namespace Reflect {
	function has<T, K extends PropertyKey>(
		target: T,
		propertyKey: K,
	): target is Extract<T, Record<K, any>>;
}
