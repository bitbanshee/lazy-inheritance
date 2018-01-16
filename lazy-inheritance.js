;(function (obj, lazyLoader) {
	// lazy-script-loader required (https://github.com/susanoobit/lazy-script-loader)
	if (!obj || !lazyLoader) {
		return;
	}

	Object.assign(obj, buildLazyInherit());
	function buildLazyInherit () {
		return {
			inherit: lazyInheritMixin_
		};

		/**
		 * Function -> Object
		 * 
		 * @param {Function} f
		 */
		function mapPrototype_ (f) {
			return f.prototype;
		}

		/**
		 * Object[] -> Boolean
		 * 
		 * @param {Object[]} infos
		 * @param {String} infos[].name
		 */
		function hasUnloaded_ (infos) {
			return infos.some(checkUnloaded_);

			/**
			 * Object -> Boolean
			 * 
			 * @param {Object} info
			 * @param {String} info.name
			 */
			function checkUnloaded_ (info) {
				return !getFunctionClassFromInfo_(info);
			}
		}

		/**
		 * Object -> Object|undefined
		 * 
		 * @param {Object} info
		 * @param {String} info.name
		 */
		function getFunctionClassFromInfo_ (info) {
			return obj[info.name];
		}

		/**
		 * TL;DR: Make synchronous inheritance using mixin inheritance. Mixins must be passed in order simulating a
		 * prototype chain order, i.e., the first mixin is the prototype from which the others will rely on and the
		 * last is the prototype whose properties overrides the others with same name.
		 * 
		 * Make synchronous inheritance using mixin inheritance, e.g., the heritor inherits from a single prototype built
		 * using the mixins' properties. Then, that single prototype inherits from the first prototype in the passed
		 * list of mixins. That way, `instanceof` would return `true` when a created object is compared to the function
		 * whose prototype is the first prototype passed. Only mixins enumerable properties are considered as well as
		 * getters and setters.
		 * 
		 * @param {Function} heritor 
		 * @param {Function[]|...Function|Array<{ name: string, url: string}>|...{ name: string, url: string}} mixins
		 */
		function inheritMixin_ (heritor, mixins = []) {
			inherit_(inheritMixinPrototypes_, ...arguments);
			
			/**
			 * Object[] -> Object
			 * 
			 * @param {Object[]} prototypes
			 */
			function inheritMixinPrototypes_ (prototypes) {
				const [main, ...mixins] = prototypes;
				if (mixins.length) {
					const mixinsDescriptors = mixins.reverse().reduce(toEnumerableDescriptorsObject, {});
					return Object.defineProperties(Object.create(main), mixinsDescriptors);
				}
				return Object.create(main);

				function getEnumerableDescriptors (object) {
					return Object.entries(Object.getOwnPropertyDescriptors(object))
						.filter(enumerable)
						.reduce(toDescriptorsObject, {});

					function enumerable ([key, value]) {
						return value.enumerable;
					}

					function toDescriptorsObject (descriptors, [key, value]) {
						descriptors[key] = value;
						return descriptors;
					}
				}

				function toEnumerableDescriptorsObject (descriptors, prototype) {
					const enumerableDescriptors = getEnumerableDescriptors(prototype);
					return Object.assign(descriptors, enumerableDescriptors);
				}
			}
		}

		/**
		 * Make asynchronous inheritance of functions if they're not loaded and synchronously if they
		 * are loaded (lazy load) using a passed 'inheritance applier' function. If any entry is not
		 * loaded, load it using an object that follows the structure { name: string, url: string }.
		 * The 'inheritance applier' function should follow the signature below:
		 * 'function (heritor: Function, fns: Function|Function[]|Array<{ name: string, url: string }> [..., {Function}])'
		 * 
		 * @param {Function} inheritanceApplierFn 
		 * @param {Function} heritor 
		 * @param {Function[]|...Function|Array<{ name: string, url: string}>|...{ name: string, url: string}} fns 
		 * @return {PromiseLike<heritor>}
		 */
		function lazyInherit_ (inheritanceApplierFn, heritor, fns = []) {
			const _fns = Array.isArray(fns) ?
				fns : [...arguments].slice(2);

			const infos = _fns
				.filter(isInfo)
				.map(shapeInfo);

			if (!infos.length || !hasUnloaded_(infos)) {
				return Promise.resolve(inheritAfterLoad(heritor, _fns));
			}

			const promises = infos.map(lazyLoader),
				fixedScopeInheritAfterLoad = inheritAfterLoad.bind(null, heritor, _fns);

			return Promise.all(promises)
				.then(fixedScopeInheritAfterLoad);

			function isInfo (entry) {
				return typeof entry == 'string' || (!!entry.name && !!entry.url);
			}

			function shapeInfo (info) {
				if (typeof info == 'string') {
					return {
						name: info,
						url: info + '.js'
					};
				}
				return info;
			}

			function inheritAfterLoad (heritor, fns) {
				const toMixinFunctions = entry => isInfo(entry) ?
					getFunctionClassFromInfo_(entry) :
					entry;
				const mixinFunctions = fns.map(toMixinFunctions);
				inheritanceApplierFn(heritor, mixinFunctions);
				return heritor;
			}
		}

		/**
		 * Make synchronous inheritance using a prototype object created by a passed reducer which is
		 * applied on an array of prototypes extrated from passed functions.
		 * 
		 * @param {Function} inputReducer
		 * @param {Function} heritor 
		 * @param {Function[]} fns 
		 */
		function inherit_ (inputReducer, heritor, fns = []) {
			Object.setPrototypeOf(heritor.prototype, inputReducer(fns.map(mapPrototype_)));
		}

		/**
		 * (Object, Object[]) -> Promise
		 * 
		 * Make asynchronous inheritance of functions if they're not loaded and synchronously if they
		 * are loaded (lazy load). See `inheritMixin_` for a detailed explanation about the inheritance model.
		 * 
		 * @param {Function} heritor 
		 * @param {Function[]|...Function|Array<{ name: string, url: string}>|...{ name: string, url: string}}  mixins
		 */
		function lazyInheritMixin_ (heritor, mixins = []) {
			return lazyInherit_(inheritMixin_, ...arguments);
		}
	};
})(window, importScript);