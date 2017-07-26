# Lazy Inheritance
**Lazy Inheritance** is a very simple component to create prototype chain and mixin inheritance patterns in JS.

## Dependencies
[__Lazy Script Loader__](https://github.com/susanoobit/lazy-script-loader): `importScript` method is required.

## Info Object
__Lazy Inheritance__ works for unloaded JS scripts using a `info` object, as described below:
```js
var infoEx = {
    // Function name
    name: `Cat`,
    // URL
    url: `scripts/animals/Cat.js`
}
```
First, name is checked to make sure the function is already loaded. If it is, the inheritance is made. If not, a request is made and the inheritance is done when the script is loaded, asynchronously.

## Methods
### `inheritMixin(heritor, inherited, mixins)`
* `heritor`: a function heritor.
* `inherited`: a function to be inherited.
* `mixins`: an array of functions to be mixed in. __Getters/Setters__ from `mixins` prototype will be ignored.
Inherit synchronously using [mixin inheritance](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#mixinpatternjavascript).

### `lazyInheritMixin(heritor, inheritedInfo, mixinInfos)` -> `Maybe Promise`
* `heritor`: a function heritor.
* `inheritedInfo`: an [info object](#info-object) describing a function to be inherited.
* `mixinInfos`: an array of [info object](#info-object) describing functions to be mixed in. __Getters/Setters__ from `mixins` prototype will be ignored.
Inherit functions asynchronously if they're not loaded and synchronously if they are loaded (lazy load) using [mixin inheritance](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#mixinpatternjavascript). A promise `Promise.all` is returned resolved for `inheritMixin` when some scripts need to be loaded.

### `inheritChain(heritor, chain)`
* `heritor`: a function heritor.
* `chain`: an array of functions to be inherited. The first function will be the lowest in the prototype chain.
Inherit synchronously using [prototype chain inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain).

### `lazyInheritChain(heritor, chainInfos)` -> `Maybe Promise`
* `heritor`: a function heritor.
* `chainInfos`: an array of [info object](#info-object) describing functions to be inherited. The first function will be the lowest in the prototype chain.
Inherit functions asynchronously if they're not loaded and synchronously if they are loaded (lazy load) using [prototype chain inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain). A promise `Promise.all` is returned resolved for `inheritChain` when some scripts need to be loaded.