;
(function (obj, lazyLoader) {
	// lazy-script-loader module required (https://github.com/susanoobit/lazy-script-loader)
	if (!lazyLoader) return;
	Object.assign(obj, buildLazyInherit());

	function buildLazyInherit() {
		/**
		 * Function -> Object
		 * @param {Function} f
		 */
		function mapPrototype_(f) {
			return f.prototype;
		}

		/**
		 * Object[] -> Object
		 * @param {Object[]} prototypes
		 */
		function inheritMixinPrototypes_(prototypes) {
			let [main, ...mixins] = prototypes;
			return Object.assign(...[Object.create(main), ...mixins]);
		}

		/**
		 * Inherit synchronously using mixin inheritance, e.g., the heritor inherits a single prototype and the mixins
		 * are fusioned to that prototype. If the mixins have properties with the same name, they'll be overwritten by
		 * the next prototype mixin. e.g., the order of mixins matters. Getters and setters are ignored for mixins.
		 * @param {Function} heritor 
		 * @param {Function} inherited 
		 * @param {Function[]} mixins 
		 */
		function inheritMixin_(heritor, inherited, mixins = []) {
			const functions = [inherited, ...mixins];
			heritor.prototype = Object.assign(
				inheritMixinPrototypes_(functions.map(mapPrototype_)),
				heritor.prototype
			);
			return heritor;
		}

		/**
		 * Inherit loaded functions synchronously. See `inheritMixin_` for a detailed explanation about the mixin
		 * inheritance used.
		 * @param {Function} heritor 
		 * @param {Object} inheritedInfo 
		 * @param {String} ininheritedInfofo.name
		 * @param {Object[]} mixinInfos
		 * @param {String} mixinInfos[].name
		 */
		function inheritLoadedMixin_(heritor, inheritedInfo, mixinInfos = []) {
			const inheritedFunction = getFunctionClassFromInfo_(inheritedInfo),
				mixinFunctions = mixinInfos.map(getFunctionClassFromInfo_);
			return inheritMixin_(heritor, inheritedFunction, mixinFunctions);
		}

		/**
		 * (Function, Object, Object[]) -> Promise | Function
		 * Inherit functions asynchronously if they're not loaded and synchronously if they are loaded (lazy load). See
		 * `inheritMixin_` for a detailed explanation about the mixin inheritance used.
		 * @param {Function} heritor 
		 * @param {Object[]|Function[]|String[]} mixinInfos
		 * @param {String} mixinInfos[].name
		 * @param {String} mixinInfos[].url
		 */
		function lazyInheritMixin_(heritor, mixinInfos = []) {
			const _mixinInfos = mixinInfos.some(info => typeof info == 'string') ?
					mixinInfos
						.filter(info => !!info.name && !!info.url)
						.concat(
							mixinInfos
								.filter(info => typeof info == 'string')
								.map(info => ({ name: info }))
						) :
					mixinInfos.filter(info => !!info.name && !!info.url),
				_loadedFunctions = mixinInfos.filter(info => typeof info == 'function');

			if (!_mixinInfos.length) {
				return inheritLoadedMixin_(heritor, _loadedFunctions);
			}

			const promises = _mixinInfos.map(lazyLoader);
			return new Promise((resolve, reject) => {
				Promise.all(promises)
					.then(
						mixins => resolve(inheritLoadedMixin_(heritor, mixins.concat(_loadedFunctions))),
						reject
					);
			})
		}

		/**
		 * Object[] -> Object
		 * @param {Object[]} prototypes
		 */
		function inheritChainPrototypes_(prototypes) {
			return Object.create(prototypes.reduce((inherited, prototype) => {
				return Object.assign(Object.create(inherited), prototype)
			}));
		}

		/**
		 * Inherit synchronously using a chain inheritance, e.g., each entry will be the prototype object
		 * of the next entry, recursively.
		 * @param {Function} heritor 
		 * @param {Function[]} chain 
		 */
		function inheritChain_(heritor, chain = []) {
			let chainPrototypes = chain.map(mapPrototype_),
				inheritedChain = inheritChainPrototypes_(chainPrototypes);
			heritor.prototype = Object.assign(inheritedChain, heritor.prototype);
		}

		/**
		 * Inherit loaded functions synchronously. See `inheritChain_` for a detailed explanation about the chain
		 * inheritance used.
		 * @param {Function} heritor 
		 * @param {Object[]} chainInfos
		 * @param {String} chainInfos[].name
		 */
		function inheritLoadedChain_(heritor, chainInfos = []) {
			let chainFunctions = chainInfos.map(getFunctionClassFromInfo_);
			inheritChain_(heritor, chainFunctions);
		}

		/**
		 * (Function, Object[]) -> Maybe Promise
		 * Inherit functions asynchronously if they're not loaded and synchronously if they are loaded (lazy load). See
		 * `inheritChain_` for a detailed explanation about the chain inheritance used.
		 * @param {Function} heritor 
		 * @param {Object[]} chainInfos
		 * @param {String} chainInfos[].name
		 * @param {String} chainInfos[].url
		 */
		function lazyInheritChain_(heritor, chainInfos = []) {
			if (!hasUnloaded_(chainInfos)) {
				inheritLoadedChain_(...arguments);
				return;
			}

			let promises = chainInfos.map(lazyLoader),
				fixedScopeInheritLoadedChain_ = inheritLoadedChain_.bind(null, ...arguments);
			return Promise.all(promises)
				.then(fixedScopeInheritLoadedChain_);
		}

		return {
			inheritMixin: inheritMixin_,
			lazyInheritMixin: lazyInheritMixin_,
			inheritChain: inheritChain_,
			lazyInheritChain: lazyInheritChain_
		};
	}
})(window, window.importScript);