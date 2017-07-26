;(function (obj, lazyLoader) {
	// lazy-script-loader module required (https://github.com/susanoobit/lazy-script-loader)
	if (!lazyLoader) return;
	Object.assign(obj, buildLazyInherit());
	function buildLazyInherit () {
		/**
		 * Function -> Object
		 * @param {Function} f
		 */
		function mapPrototype_ (f) {
			return f.prototype;
		}

		/**
		 * Object[] -> Boolean
		 * @param {Object[]} infos
		 * @param {String} infos[].name
		 */
		function hasUnloaded_ (infos) {
			return infos.some(checkUnloaded_);
		}

		/**
		 * Object -> Boolean
		 * @param {Object} info
		 * @param {String} info.name
		 */
		function checkUnloaded_ (info) {
			return !getFunctionClassFromInfo_(info);
		}

		/**
		 * Object -> Object
		 * @param {Object} info
		 * @param {String} info.name
		 */
		function getFunctionClassFromInfo_ (info) {
			return window[info.name];
		}

		/**
		 * Object[] -> Object
		 * @param {Object[]} prototypes
		 */
		function inheritMixinPrototypes_ (prototypes) {
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
		function inheritMixin_ (heritor, inherited, mixins = []) {
			let functions = [inherited, ...mixins];
			heritor.prototype = Object.assign(inheritMixinPrototypes_(functions.map(mapPrototype_)), heritor.prototype);
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
		function inheritLoadedMixin_ (heritor, inheritedInfo, mixinInfos = []) {
			let inheritedFunction = getFunctionClassFromInfo_(inheritedInfo),
				mixinFunctions = mixinInfos.map(getFunctionClassFromInfo_);
			inheritMixin_(heritor, inheritedFunction, mixinFunctions);
		}

		/**
		 * (Function, Object, Object[]) -> Maybe Promise
		 * Inherit functions asynchronously if they're not loaded and synchronously if they are loaded (lazy load). See
		 * `inheritMixin_` for a detailed explanation about the mixin inheritance used.
		 * @param {Function} heritor 
		 * @param {Object} inheritedInfo 
		 * @param {String} ininheritedInfofo.name
		 * @param {String} ininheritedInfofo.url
		 * @param {Object[]} mixinInfos
		 * @param {String} mixinInfos[].name
		 * @param {String} mixinInfos[].url
		 */
		function lazyInheritMixin_ (heritor, inheritedInfo, mixinInfos = []) {
			let infos = [inheritedInfo, ...mixinInfos];

			if (!hasUnloaded_(infos)) {
				inheritLoadedMixin_(...arguments);
				return;
			}

			let promises = infos.map(lazyLoader),
				fixedScopeInheritLoadedMixin_ = inheritLoadedMixin_.bind(null, ...arguments);
			return Promise.all(promises)
				.then(fixedScopeInheritLoadedMixin_);
		}
		
		/**
		 * Object[] -> Object
		 * @param {Object[]} prototypes
		 */
		function inheritChainPrototypes_ (prototypes) {
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
		function inheritChain_ (heritor, chain = []) {
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
		function inheritLoadedChain_ (heritor, chainInfos = []) {
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
		function lazyInheritChain_ (heritor, chainInfos = []) {
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
	};
})(window, window.importScript);