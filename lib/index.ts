import {Adapter} from "./adapters/adapter";
import {DefaultAdapter} from "./adapters/default-adapter";
import {ObjectionAdapter} from "./adapters/objection-adapter";
import {FixtureRiveter} from "./fixture-riveter";

const fr = new FixtureRiveter();

export {
	fr,
	Adapter,
	DefaultAdapter,
	ObjectionAdapter,
};
