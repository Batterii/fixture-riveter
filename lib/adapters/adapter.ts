export interface Adapter {
	build<T>(Model: any): T;
	save<T>(instance: T, Model?: any): Promise<T>;
	destroy(instance: Record<string, any>, Model?: any): Promise<void>;
	associate(instance: any, name: string, other: any): Promise<Record<string, any>>;
	set(instance: Record<string, any>, key: string, value: any): Promise<Record<string, any>>;
}
