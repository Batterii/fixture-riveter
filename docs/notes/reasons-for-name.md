# Thoughts on the name

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
[factory_bot_name]: https://github.com/thoughtbot/factory_bot/blob/master/NAME.md
[wiki_fixtures]: https://en.wikipedia.org/wiki/Test_fixture
[rosie]: https://en.wikipedia.org/wiki/Rosie_the_Riveter
