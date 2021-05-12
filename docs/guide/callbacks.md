# Callbacks

`fixture-riveter` accepts callbacks in many places in the API; this part of the guide is focused on callbacks in the fixture build process, which act as hooks to modify the built instance or make stateful changes elsewhere.

## Defaults
By default, there are 3 callbacks that are triggered:
* `after("build", ...)`, called after the fixture instance has been built (in `fr.build` and `fr.create`)
* `before("create", ...)`, called before the fixture instance is saved (in `fr.create`)
* `after("create", ...)`, called after the fixture instance is saved (in `fr.create`)
