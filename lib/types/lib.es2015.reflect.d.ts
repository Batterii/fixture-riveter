// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

declare namespace Reflect {
	function has<T, K extends PropertyKey>(
		target: T,
		propertyKey: K,
	): target is Extract<T, Record<K, any>>;
}
