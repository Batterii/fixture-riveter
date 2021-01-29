export interface Adapter {
	build<T>(Model: any): T;
	save<T>(instance: T, Model?: any): Promise<T>;
	destroy(instance: Record<string, any>, Model?: any): Promise<void>;
	relate(instance: any, name: string, other: any, Model?: any): Promise<Record<string, any>>;
	set(instance: Record<string, any>, key: string, value: any): Promise<Record<string, any>>;
}
