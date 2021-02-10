## `Adapter`

Instead of writing ORM-specific code for instancing and persisting created objects, we rely on this interface (and the following default implementation of it). This handles the two aforementioned aspects of [factory_bot][factory_bot]: creating an instance of a given model, and then persisting it to the database. (There are other reasons to use it, but that's less important.)

[factory_bot]: https://github.com/thoughtbot/factory_bot/

The `DefaultAdapter` has barebones implementations of each of the interface's functions to keep code DRY and focused only on the methods that matter. The expectation is that any implementations of `Adapter` will be based on `DefaultAdapter`.

##### Example

```typescript
import {fr, DefaultAdapter} from "fixture-riveter";

export class UserAdapter extends DefaultAdapter {
	// This model needs `isNew` set before any fields are set.
	build<T>(Model: any): T {
		const instance = new Model();
		instance.isNew = true;
		return instance;
	}
}

fr.setAdapter(new UserAdapter(), "user");
```

### `Adapter` methods

None of the methods on an `Adapter` will be exposed to the user; they are called internally at various points in the generation of a given fixture. Therefore, the examples below are merely to demonstrate how the function works and will use the `DefaultAdapter`'s implementations.

#### build

Called to create an instance of the fixture's Model class. Unless specific arguments are required, `DefaultAdapter`'s implementation is generally good enough.

##### Arguments

| Argument | Type           | Description                                                                      | Optional? |
|----------|----------------|----------------------------------------------------------------------------------|-----------|
| Model    | Class function | The class function (constructor) | Required  |

##### Return value

| Type           | Description       |
|----------------|-------------------|
| Class instance | Instance of Model |

##### Example

```typescript
class User {}

const user = adapter.build(User);
user instanceof User
// true
```

#### save

Called to persist the instance to the database. Must return the persisted instance, not the parameter instance (if there is a difference). Accepts the class function to allow for static methods on the class to handle persistence (for example, Objection.js).

##### Arguments

| Argument | Type           | Description                      | Optional? |
|----------|----------------|----------------------------------|-----------|
| instance | Class instance | Instance of Model                | Required  |
| Model    | Class function | The class function (constructor) | Optional  |

##### Return value

| Type           | Description  |
|----------------|--------------|
| Class instance | The instance |

##### Example

```typescript
class User {}

let user = new User();
user.id
// undefined
user = await adapter.save(user, User);
user.id
// 1
```

#### destroy

Called to delete or remove the instance from the database. Must gracefully handle if the instance has not been persisted to the database (for instance, the instance was constructed with `fr.build`, not `fr.create`). Accepts the class function to allow for static methods on the class to handle deletion (for example, Objection.js).

##### Arguments

| Argument | Type           | Description                      | Optional? |
|----------|----------------|----------------------------------|-----------|
| instance | Class instance | Instance of Model                | Required  |
| Model    | Class function | The class function (constructor) | Optional  |

##### Return value

| Type    | Description |
|---------|-------------|
| Promise | A promise   |

##### Example

```typescript
class User {}

let user = new User();
await user.save();
await adapter.delete(user, User);
await User.query().findById(user.id);
// []
```

#### relate

Called to "join" two fixture instances together.

::: warning
TODO: clean me up
:::

##### Arguments

| Argument | Type           | Description                              | Optional? |
|----------|----------------|------------------------------------------|-----------|
| instance | Class instance | Instance of a fixture                    | Required  |
| name     | string         | Property on `instance` to set `other` to | Required  |
| other    | Class instance | Instance of a fixture                    | Required  |
| Model    | Class function | The class function (constructor)         | Optional  |

##### Return value

| Type           | Description  |
|----------------|--------------|
| Class instance | The instance |

##### Example

```typescript
class User {}
class Post {
	user: User;
}

const user = new User();
let post = new Post();
post.user
// undefined
post = adapter.relate(post, "user", user);
post.user === user;
// true
```

#### set

Called to set a property on a fixture instance. Returns the whole instance just in case???

::: warning
TODO: clean me up
:::

##### Arguments

(instance: any, key: string, value: any)

| Argument | Type           | Description                        | Optional? |
|----------|----------------|------------------------------------|-----------|
| instance | Class instance | Instance of a fixture              | Required  |
| key      | string         | Property on `instance`             | Required  |
| value    | any            | A value from an attribute function | Required  |

##### Return value

| Type           | Description  |
|----------------|--------------|
| Class instance | The instance |

##### Example

```typescript
class User {}

let user = new User();
user = adapter.set(user, "firstName", "Noah");
user.firstName
// "Noah"
```
