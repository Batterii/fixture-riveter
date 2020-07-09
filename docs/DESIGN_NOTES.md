# Design Notes

## Differences from factory_bot

As noted in the README, the primary source of inspiration is [factory_bot][factory_bot].
After attempting to use many of the similar libraries that exist in the javascript
world, I grew annoyed at the lack of features and robust internal design. I also didn't
have much Typescript experience and viewed the chance to convert an existing library to
TS would be a fantastic learning opportunity.

This library diverges from [factory_bot][factory_bot] in a couple major ways. First,
[factory_bot][factory_bot] relies heavily on Ruby's metaprogramming capabilities,
`instance_exec`, `method_missing`, and `define_method`. Second, Ruby (and Rails
alongside it) are synchronous, which means that there is no consideration for awaiting
calls to a database or performing assignments "out of order". And finally,
[factory_bot][factory_bot] is tightly coupled with Rails' ideas about persistence (even
tho it tries to be ORM agnostic).

The issue of metaprogramming is handled by a combination of approaches. The first is to
pass in the fixture or evaluator wherever it's being used, instead of parsing implicit
method calls. The second approach is to use `call` everywhere, making sure that the
option of using full `function` statements instead of arrow functions keeps `this`
correctly applied.

The issue of async I handled by biting the bullet and just making all appropriate calls
async. Sadly, this makes using an attribute within another attribute _very_ verbose,
which is unfortunate (as seen below), but none of the javascript ORMs are synchronous
and it's not possible to avoid when a given attribute can reference an association. (I
toyed with disallowing referencing associations, which would let all other attributes be
synchronous, but that limits any complex async attributes from being defined.)

Example of referencing another attribute within an attribute in javascript:

```
// explicit
t.attr("email", async(e) => `${await e.attr("name")}@example.com`);

// or implicit
t.email(async(e) => `${await e.name()}@example.com`);
```

versus in ruby:

```
email { "#{name}@example.com" }
```

To keep evaluation simple, I deliberately kept all async calls synchronous otherwise,
meaning that for a given async call, the library waits until it is finished, instead of
deferring and then calling `Promise.all` or similar after the end. This also keeps the
code the cleanest, making attribute assignment readable and consistent with synchronous
calls.

To tackle the issue of tight coupling, I took inspiration from the adapter system in
simonexmachina's javascript library [factory-girl][factory_girl]. Each ORM can define
and handle the core calls differently, and each fixture can use whichever is most
appropriate. This frees up the need to implement [factory_bot][factory_bot]'s
`to_create`, `skip_create`, or `initialize_with`. Instead, the user can define a new
adapter (extending an existing adapter if necessary) and override any of the functions.
This allows for keeping one's custom construction and persistence functions DRY.

## Thoughts on the name

[factory_bot][factory_bot] based the original name on the Factory method and Object
Mother software patterns (as discussed [here][factory_bot_name]). However, what
factory_bot and similar libraries create are closer to [fixtures][wiki_fixtures]. So
while one defines a fixture factory/builder, the goal is to output the equivalent of
a fixture (which traditionally are written once and fixed throughout the life of the
tests). When first developing fixture-riveter, the temporary name factory-builder was
used, but it's both incorrect as an abstraction and the name is already in use.

In thinking about the original name "factory_girl", I thought of [Rosie the
Riveter][rosie]. I agree with thoughtbot's decision to keep their library gender
neutral; there's no reason to gender such things. But as my own nod, "riveter" is
a fantastic word and it denotes one who joins two objects, who rivets things together.
In much the same way, this and similar libraries join your application with fake data,
allowing for easier testing.

Thus, the name **fixture-riveter**. Internally, only the top-level object is called
fixture-riveter; all of the definitions are called "fixtures" to keep the naming
consistent. You define and then build/create fixtures, and the instances of a fixture
are what you use in your tests.

[factory_bot]: https://github.com/thoughtbot/factory_bot/
[factory_girl]: https://github.com/simonexmachina/factory-girl
[wiki_fixtures]: https://en.wikipedia.org/wiki/Test_fixture
[factory_bot_name]: https://github.com/thoughtbot/factory_bot/blob/master/NAME.md
[rosie]: https://en.wikipedia.org/wiki/Rosie_the_Riveter
