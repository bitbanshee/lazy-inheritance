# Lazy Inheritance
**Lazy Inheritance** is a simple component to create prototype mixin inheritance in JS.

## Dependencies
[__Lazy Script Loader__](https://github.com/susanoobit/lazy-script-loader): `importScript` method is required.

## Info Object
__Lazy Inheritance__ works for unloaded JS scripts using a `info` object. See [__Lazy Script Loader__](https://github.com/susanoobit/lazy-script-loader) for further information.

## Methods
### `inherit(heritor, mixins)`
* `heritor`: a function heritor.
* `mixins`: an array of functions to be mixed in. __Getters/Setters__ from `mixins` prototype will be considered.

The first function in `mixins` is used to make common prototypical inheritance. The remaining functions are used to make inheritance using some technique close to [mixin inheritance](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#mixinpatternjavascript). What that means: when an object is created, `instanceof` will return `true` only when used against the first function in `mixins`, but parameters will be overridden by each remaining functions prototypes parameters, progressively.