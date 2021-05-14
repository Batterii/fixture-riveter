# Hooks

In the process of constructing an object from a fixture, it can be necessary (or at least helpful) to run arbitrary code with the constructed object before it is returned: generating passwords, defining relationships, populating a cache, etc. This process is called [hooking] on Wikipedia; [factory_bot] calls them "[callbacks]".

[hooking]: https://en.wikipedia.org/wiki/Hooking
[factory_bot]: https://github.com/thoughtbot/factory_bot
[callbacks]: https://github.com/thoughtbot/factory_bot/blob/master/GETTING_STARTED.md#callbacks

In simplest terms, a hook is an object that holds string name and a 2-argument function. When a [Strategy] calls `runHooks("X", instance)`, all of the hooks that are named `"X"` are gathered (following the [scoping] rules) and then, in the order they're defined, their functions are executed on the current [instance].

[Strategy]: ../api/strategy.md
[scoping]: ./glossary.md#scope
[instance]: ./glossary.md#instance

## Defaults

By default, there are 3 hooks:

* `after("build", ...)` is called after the fixture instance has been built (in `fr.build` and `fr.create`)
* `before("create", ...)` is called before the fixture instance is saved (in `fr.create`)
* `after("create", ...)` is called after the fixture instance is saved (in `fr.create`)
