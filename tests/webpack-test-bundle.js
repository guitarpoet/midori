/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			var styleTarget = fn.call(this, selector);
			// Special case to return head of iframe instead of iframe itself
			if (styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[selector] = styleTarget;
		}
		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(5);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
__webpack_require__(6);

const a = 1;

class Hello {
	constructor(name) {
		this.name = name;
	}

	world() {
		console.info("Hello " + this.name);
	}
}

const greetings = new Hello("Jack");

greetings.world();


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(4);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--1-1!../../src/loader.js!./_simple.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--1-1!../../src/loader.js!./_simple.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(true);
// imports


// module
exports.push([module.i, "/**\n * This is the test variables\n */\nh1 {\n  color: green; }\n\n/**\n * This is the file to provide all core functions for midori\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Wed Nov 15 15:03:40 2017\n */\n/**\n * Enable the auto prefixer by default\n */\n/**\n * Get the color from the palette for you\n */\n/**\n * The flex box prefixers\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 15:12:58 2017\n */\n/**\n * This is the form auto prefixer\n * \n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 15:34:56 2017\n *\n */\n/**\n * The scss file for all the generic form functions and mixins\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Wed Nov 15 14:47:08 2017\n * @import sass-mq/mq\n */\n/**\n * The scss file for all the generic table function and mixins\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Wed Nov 15 14:40:59 2017\n * @import sass-mq/mq\n *\n */\n/**\n * The midori table responsive, you can use this to make your table work responsively\n *\n * Simple use this mixin like this:\n *\n * <code>\n *\n * .data-table {\n *     @include midori-table-responsive($from: mobile) {\n *         // Here put your styles for the responsive header of each td\n *     }\n * }\n *\n * </code>\n *\n * @parameter $from\n *      From which width will make this table responsive \n * @parameter $attr\n *      Get the responsive table header content from which attribute of the td, will be data-th by default\n * @parameter $suffix\n *      Add the suffix to the table header content, will be \": \" by default\n *\n */\n/**\n * The prefixer mixins for background\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 14:29:50 2017\n * @import midori/core\n */\n/*\n * Mixin printing a linear-gradient\n * as well as a plain color fallback\n * and the `-webkit-` prefixed declaration\n * @access public\n * @param {Keyword | Angle} $direction - Linear gradient direction\n * @param {Arglist} $color-stops - List of color-stops composing the gradient\n *\n * @see https://www.sitepoint.com/building-linear-gradient-mixin-sass/\n */\n/**\n * This is the base scss\n *\n * @import css/variables\n * @import midori/components/form\n */\n/**\n * This is the powerful auto prefixer, you can use most of the css mixins using this auto prefixer\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 14:20:23 2017\n *\n * @import midori/prefixer/background\n * @import midori/prefixer/flex\n * @import midori/prefixer/form\n */\n/**\n * This is the simple scss\n *\n * @import css/base\n * @import midori/components/table\n */\n/**\n * The mixin and functions for flex box\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 13:41:20 2017\n *\n * @import midori/prefixer\n */\n/**\n * This is the wild scss\n */\n/**\n * This is the powerful grid library used for create your grid system\n *\n * It will support 3 types of grid:\n *\n * 1. The flex based grid system\n * 2. The percentage and float left grid system\n * 3. The CSS grid system\n *\n * You can choose the one you want to use including corresponding mixins.\n *\n * It is highly customizable, you can customize:\n *\n * 1. Breakpoints\n * 2. Column count\n * 3. Seperator\n * 4. Column names\n * 5. Column gap\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 12:10:34 2017\n *\n * @import sass-mq/mq, midori/flex\n */\n._simple-midori-container-defaults___25uDd {\n  height: auto;\n  margin-right: auto;\n  margin-left: auto;\n  padding-right: 15px;\n  padding-left: 15px; }\n\n/**\n * This is the test file for testing using webpack\n * \n * @import css/base, css/simple\n * @import css/wild(css/simple)\n * @import css/css-test\n * @import midori/grid\n */\nbody {\n  width: 100%;\n  height: 100%; }\n", "", {"version":3,"sources":["/Users/jack/work/cxagroup/midori/tests/css/tests/css/_variables.scss","/Users/jack/work/cxagroup/midori/tests/css/tests/css/css-test.css","/Users/jack/work/cxagroup/midori/tests/css/midori/_core.scss","/Users/jack/work/cxagroup/midori/tests/css/midori/prefixer/_flex.scss","/Users/jack/work/cxagroup/midori/tests/css/midori/prefixer/_form.scss","/Users/jack/work/cxagroup/midori/tests/css/midori/components/_form.scss","/Users/jack/work/cxagroup/midori/tests/css/midori/components/_table.scss","/Users/jack/work/cxagroup/midori/tests/css/midori/prefixer/_background.scss","/Users/jack/work/cxagroup/midori/tests/css/tests/css/_base.scss","/Users/jack/work/cxagroup/midori/tests/css/midori/_prefixer.scss","/Users/jack/work/cxagroup/midori/tests/css/tests/css/_simple.scss","/Users/jack/work/cxagroup/midori/tests/css/midori/_flex.scss","/Users/jack/work/cxagroup/midori/tests/css/tests/css/wild.scss","/Users/jack/work/cxagroup/midori/tests/css/midori/_grid.scss","/Users/jack/work/cxagroup/midori/tests/css/tests/css/webpack.scss"],"names":[],"mappings":"AAAA;;GAEG;ACFH;EACC,aAAY,EACZ;;ACFD;;;;;;GAMG;AAEH;;GAEG;AAaH;;GAEG;ACzBH;;;;;;GAMG;ACNH;;;;;;;GAOG;ACPH;;;;;;;GAOG;ACPH;;;;;;;;GAQG;AAEH;;;;;;;;;;;;;;;;;;;;;;GAsBG;AChCH;;;;;;GAMG;AAkBH;;;;;;;;;GASG;ACjCH;;;;;GAKG;ACLH;;;;;;;;;;GAUG;ACVH;;;;;GAKG;ACLH;;;;;;;;GAQG;ACRH;;GAEG;ACFH;;;;;;;;;;;;;;;;;;;;;;;;GAwBG;AAcH;EACC,aAAY;EACZ,mBAbmC;EAcnC,kBAbkC;EAclC,oBAboC;EAcpC,mBAbmC,EAcnC;;AC5CD;;;;;;;GAOG;AAEH;EJDC,YVJmB;EUKnB,aVJoB,EcMpB","file":"_simple.scss","sourcesContent":["/**\n * This is the test variables\n */\n$name: world;\n$default-width: 100%;\n$default-height: 100%;\n","h1 {\n\tcolor: green;\n}\n","/**\n * This is the file to provide all core functions for midori\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Wed Nov 15 15:03:40 2017\n */\n\n/**\n * Enable the auto prefixer by default\n */\n$midori-enable-autoprefixer: true !default;\n\n@function midori-get-keys($map) {\n    $keys: ();\n\n    @each $key, $val in $chart-colours {\n        $keys: append($keys, $key);\n    }\n\n    @return $keys;\n}\n\n/**\n * Get the color from the palette for you\n */\n@function midori-get-color($group, $name, $palette) {\n    $color: map-get(map-get($palette, $group), $name);\n\n    // if the colour isn't found in the provided palette, throw an error\n    @if $color == null {\n        @error \"Color #{$name} not found in this palette #{$group}.\";\n    }\n\n    @return $color;\n}\n\n@function midori-is-direction($value) {\n  $is-keyword: index((to top, to top right, to right top, to right, to bottom right, to right bottom, to bottom, to bottom left, to left bottom, to left, to left top, to top left), $value);\n  $is-angle: type-of($value) == 'number' and index('deg' 'grad' 'turn' 'rad', unit($value));\n\n  @return $is-keyword or $is-angle;\n}\n\n\n/// Convert a direction to legacy syntax\n/// @param {Keyword | Angle} $value - Value to convert\n/// @require {function} is-direction\n/// @require {function} convert-angle\n/// @throw Cannot convert `#{$value}` to legacy syntax because it doesn't seem to be a direction.;\n/// @see https://www.sitepoint.com/building-linear-gradient-mixin-sass/\n@function midori-legacy-direction($value) {\n\t@if \"#{$value}\" == \"to top\" {\n\t\t@return bottom;\n\t}\n\n\t@if $value == \"to top right\" {\n\t\t@return bottom left;\n\t}\n\n\t@if $value == \"to right top\" {\n\t\t@return left bottom;\n\t}\n\n\t@if $value == \"to right\" {\n\t\t@return left bottom;\n\t}\n\n\t@if $value == \"to bottom right\" {\n\t\t@return top left;\n\t}\n\n\t@if $value == \"to right bottom\" {\n\t\t@return left top;\n\t}\n\n\t@if $value == \"to bottom\" {\n\t\t@return top;\n\t}\n\n\t@if $value == \"to bottom left\" {\n\t\t@return top right;\n\t}\n\n\t@if $value == \"to left bottom\" {\n\t\t@return right top;\n\t}\n\n\t@if $value == \"to left\" {\n\t\t@return right;\n\t}\n\n\t@if $value == \"to left top\" {\n\t\t@return right bottom;\n\t}\n\n\t@if $value == \"to top left\" {\n\t\t@return bottom right;\n\t}\n\n\t@return 90deg - $value;\n}\n","/**\n * The flex box prefixers\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 15:12:58 2017\n */\n\n@mixin midori-flexbox {\n\tdisplay: -webkit-box;\n\tdisplay: -webkit-flex;\n\tdisplay: -moz-flex;\n\tdisplay: -ms-flexbox;\n\tdisplay: flex;\n}\n\n@mixin midori-inline-flexbox {\n\tdisplay: -webkit-box;\n\tdisplay: -webkit-flex;\n\tdisplay: -moz-flex;\n\tdisplay: -ms-flexbox;\n\tdisplay: flex;\n}\n\n@mixin midori-flex-direction($value: row) {\n\t@if $value == row-reverse {\n\t\t-webkit-box-direction: reverse;\n\t\t-webkit-box-orient: horizontal;\n\t}\n\t@else if $value == column {\n\t\t-webkit-box-direction: normal;\n\t\t-webkit-box-orient: vertical;\n\t}\n\t@else if $value == column-reverse {\n\t\t-webkit-box-direction: reverse;\n\t\t-webkit-box-orient: vertical;\n\t}\n\t@else {\n\t\t-webkit-box-direction: normal;\n\t\t-webkit-box-orient: horizontal;\n\t}\n\n\t-webkit-flex-direction: $value;\n\t-moz-flex-direction: $value;\n\t-ms-flex-direction: $value;\n\tflex-direction: $value;\n}\n\n@mixin midori-flex-wrap($value: nowrap) {\n\t// No Webkit Box fallback.\n\t-webkit-flex-wrap: $value;\n\t-moz-flex-wrap: $value;\n\n\t@if $value == nowrap {\n\t\t-ms-flex-wrap: none;\n\t}\n\t@else {\n\t\t-ms-flex-wrap: $value;\n\t}\n\n\tflex-wrap: $value;\n}\n\n@mixin midori-flex-flow($values: row nowrap) {\n\t-webkit-flex-flow: $values;\n\t-moz-flex-flow: $values;\n\t-ms-flex-flow: $values;\n\tflex-flow: $values;\n}\n\n@mixin midori-order($int: 0) {\n\t-webkit-box-ordinal-group: $int + 1;\n\t-webkit-order: $int;\n\t-moz-order: $int;\n\t-ms-flex-order: $int;\n\torder: $int;\n}\n\n@mixin midori-flex-grow($int: 0) {\n\t-webkit-box-flex: $int;\n\t-webkit-flex-grow: $int;\n\t-moz-flex-grow: $int;\n\t-ms-flex-positive: $int;\n\tflex-grow: $int;\n}\n\n@mixin midori-flex-shrink($int: 1) {\n\t-webkit-flex-shrink: $int;\n\t-moz-flex-shrink: $int;\n\t-ms-flex-negative: $int;\n\tflex-shrink: $int;\n}\n\n@mixin midori-flex-basis($value: auto) {\n\t-webkit-flex-basis: $value;\n\t-moz-flex-basis: $value;\n\t-ms-flex-preferred-size: $value;\n\tflex-basis: $value;\n}\n\n@mixin midori-justify-content($value: flex-start) {\n\t@if $value == flex-start {\n\t\t-webkit-box-pack: start;\n\t\t-ms-flex-pack: start;\n\t} @else if $value == flex-end {\n\t\t-webkit-box-pack: end;\n\t\t-ms-flex-pack: end;\n\t} @else if $value == space-between {\n\t\t-webkit-box-pack: justify;\n\t\t-ms-flex-pack: justify;\n\t} @else if $value == space-around {\n\t\t-ms-flex-pack: distribute;\t\t\n\t} @else {\n\t\t-webkit-box-pack: $value;\n\t\t-ms-flex-pack: $value;\n\t}\n\t-webkit-justify-content: $value;\n\t-moz-justify-content: $value;\n\tjustify-content: $value;\n}\n\n@mixin midori-align-items($value: stretch) {\n\t@if $value == flex-start {\n\t\t-webkit-box-align: start;\n\t\t-ms-flex-align: start;\n\t} @else if $value == flex-end {\n\t\t-webkit-box-align: end;\n\t\t-ms-flex-align: end;\n\t} @else {\n\t\t-webkit-box-align: $value;\n\t\t-ms-flex-align: $value;\n\t}\n\t-webkit-align-items: $value;\n\t-moz-align-items: $value;\n\talign-items: $value;\n}\n\n@mixin midori-align-self($value: auto) {\n\t// No Webkit Box Fallback.\n\t-webkit-align-self: $value;\n\t-moz-align-self: $value;\n\t@if $value == flex-start {\n\t\t-ms-flex-item-align: start;\n\t} @else if $value == flex-end {\n\t\t-ms-flex-item-align: end;\n\t} @else {\n\t\t-ms-flex-item-align: $value;\n\t}\n\talign-self: $value;\n}\n\n@mixin midori-align-content($value: stretch) {\n\t// No Webkit Box Fallback.\n\t-webkit-align-content: $value;\n\t-moz-align-content: $value;\n\t@if $value == flex-start {\n\t\t-ms-flex-line-pack: start;\n\t} @else if $value == flex-end {\n\t\t-ms-flex-line-pack: end;\n\t} @else {\n\t\t-ms-flex-line-pack: $value;\n\t}\n\talign-content: $value;\n}\n","/**\n * This is the form auto prefixer\n * \n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 15:34:56 2017\n *\n */\n\n@mixin midori-placeholder($color, $opacity: 1) {\n\t@if $enable-autoprefixer {\n\t\t&::-webkit-input-placeholder {\n\t\t\tcolor: $color;\n\t\t\topacity: $opacity;\n\t\t}\n\n\t\t&::-moz-placeholder {\n\t\t\tcolor: $color;\n\t\t\topacity: $opacity;\n\t\t}\n\n\t\t&:-ms-input-placeholder {\n\t\t\tcolor: $color;\n\t\t\topacity: $opacity;\n\t\t}\n\t}\n\n\t&::placeholder {\n\t\tcolor: $color;\n\n\t\t// Override Firefox's unusual default opacity; see https://github.com/twbs/bootstrap/pull/11526.\n\t\topacity: $opacity;\n\t}\n}\n","/**\n * The scss file for all the generic form functions and mixins\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Wed Nov 15 14:47:08 2017\n * @import sass-mq/mq\n */\n","/**\n * The scss file for all the generic table function and mixins\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Wed Nov 15 14:40:59 2017\n * @import sass-mq/mq\n *\n */\n\n/**\n * The midori table responsive, you can use this to make your table work responsively\n *\n * Simple use this mixin like this:\n *\n * <code>\n *\n * .data-table {\n *     @include midori-table-responsive($from: mobile) {\n *         // Here put your styles for the responsive header of each td\n *     }\n * }\n *\n * </code>\n *\n * @parameter $from\n *      From which width will make this table responsive \n * @parameter $attr\n *      Get the responsive table header content from which attribute of the td, will be data-th by default\n * @parameter $suffix\n *      Add the suffix to the table header content, will be \": \" by default\n *\n */\n@mixin midori-table-responsive($from: tablet, $attr: data-th, $suffix: \": \") {\n    th {\n        display: none;\n        @include mq($from: $from) {\n            display: table-cell;\n        }\n    }\n\n    td {\n        display: block;\n        @include mq($from: $from) {\n            display: table-cell;\n        }\n    }\n\n    td::before {\n        @content;\n        content: attr($attr) $suffix;\n        display: block;\n        font-weight: normal;\n\n        @include mq($from: $from) {\n            display: none;\n        }\n    }\n}\n\n@mixin midori-table-row($type: even) {\n    & > tbody > tr:nth-child(#{$type}) > td {\n        @content;\n    }\n}\n\n@mixin midori-table-responsive-row($from: tablet, $type: even) {\n    @include mq($until: $from) {\n        & > tbody > tr > td:nth-child(#{$type}) {\n            @content;\n        }\n    }\n}\n","/**\n * The prefixer mixins for background\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 14:29:50 2017\n * @import midori/core\n */\n\n@mixin midori-background-clip($value) {\n\t@if $midori-enable-autoprefixer {\n\t\t-webkit-background-clip: $value;\n\t}\n\n\tbackground-clip: $value;\n}\n\n@mixin midori-background-size($value) {\n\t@if $midori-enable-autoprefixer {\n\t\t-webkit-background-size: $value;\n\t}\n\n\tbackground-size: $value;\n}\n\n/*\n * Mixin printing a linear-gradient\n * as well as a plain color fallback\n * and the `-webkit-` prefixed declaration\n * @access public\n * @param {Keyword | Angle} $direction - Linear gradient direction\n * @param {Arglist} $color-stops - List of color-stops composing the gradient\n *\n * @see https://www.sitepoint.com/building-linear-gradient-mixin-sass/\n */\n@mixin midori-linear-gradient($direction, $color-stops...) {\n\t@if $midori-enable-autoprefixer {\n\t\t// Direction has been omitted and happens to be a color-stop\n\t\t@if midori-is-direction($direction) == false {\n\t\t\t$color-stops: $direction, $color-stops;\n\t\t\t$direction: 180deg;\n\t\t}\n\n\t\tbackground: nth(nth($color-stops, 1), 1);\n\t\tbackground: -webkit-linear-gradient(midori-legacy-direction($direction), $color-stops);\n\t\tbackground: -o-linear-gradient(midori-legacy-direction($direction), $color-stops);\n\t}\n\n\tbackground: linear-gradient($direction, $color-stops);\n}\n","/**\n * This is the base scss\n *\n * @import css/variables\n * @import midori/components/form\n */\n\n@function five-times($value: 10px) {\n\t@return 5 * $value;\n}\n","/**\n * This is the powerful auto prefixer, you can use most of the css mixins using this auto prefixer\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 14:20:23 2017\n *\n * @import midori/prefixer/background\n * @import midori/prefixer/flex\n * @import midori/prefixer/form\n */\n\n@mixin midori-autoprefixer($name, $value: null) {\n\t@if $name == background-clip {\n\t\t@include midori-background-clip($value);\n\t} \n\t@if $name == background-size {\n\t\t@include midori-background-size($value);\n\t} \n\t@if $name == flexbox {\n\t\t@include midori-flexbox;\n\t} \n\t@if $name == inline-flexbox {\n\t\t@include midori-inline-flexbox;\n\t} \n\t@if $name == flex-direction {\n\t\t@include midori-flex-direction($value);\n\t}\n\t@if $name == flex-wrap {\n\t\t@include midori-flex-wrap($value);\n\t}\n\t@if $name == flex-flow {\n\t\t@include midori-flex-flow($value);\n\t}\n\t@if $name == order {\n\t\t@include midori-order($value);\n\t}\n\t@if $name == flex-grow {\n\t\t@include midori-flex-grow($value);\n\t}\n\t@if $name == flex-shrink {\n\t\t@include midori-flex-shrink($value);\n\t}\n\t@if $name == flex-basis {\n\t\t@include midori-flex-basis($value);\n\t}\n\t@if $name == justify-content {\n\t\t@include midori-justify-content($value);\n\t}\n\t@if $name == align-items {\n\t\t@include midori-align-items($value);\n\t}\n\t@if $name == align-self {\n\t\t@include midori-align-self($value);\n\t}\n\t@if $name == align-content {\n\t\t@include midori-align-self($value);\n\t}\n}\n","/**\n * This is the simple scss\n *\n * @import css/base\n * @import midori/components/table\n */\n\n@mixin simple {\n\twidth: $default-width;\n\theight: $default-height;\n}\n","/**\n * The mixin and functions for flex box\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 13:41:20 2017\n *\n * @import midori/prefixer\n */\n\n@mixin midori-flex-display {\n\t@include midori-autoprefixer(flexbox);\n}\n\n@mixin midori-inline-flex-display {\n\t@include midori-autoprefixer(inline-flexbox);\n}\n\n@mixin midori-flex($fg: 1, $fs: null, $fb: null) {\n\t// Set a variable to be used by box-flex properties\n\t$fg-boxflex: $fg;\n\n\t// Box-Flex only supports a flex-grow value so let's grab the\n\t// first item in the list and just return that.\n\t@if type-of($fg) == \"list\" {\n\t\t$fg-boxflex: nth($fg, 1);\n\t}\n\n\t-webkit-box-flex: $fg-boxflex;\n\t-webkit-flex: $fg $fs $fb;\n\t-moz-box-flex: $fg-boxflex;\n\t-moz-flex: $fg $fs $fb;\n\t-ms-flex: $fg $fs $fb;\n\tflex: $fg $fs $fb;\n}\n\n@mixin midori-flex-width($args) {\n\t$width: percentage($args);\n\t@include midori-autoprefixer(flex-basis, $width);\n\twidth: 100%;\n\tmax-width: $width;\n}\n","/**\n * This is the wild scss\n */\n@mixin wild {\n\tdiv.wild {\n\t\t// We need simple to be included too\n\t\t@include simple;\n\t}\n}\n","/**\n * This is the powerful grid library used for create your grid system\n *\n * It will support 3 types of grid:\n *\n * 1. The flex based grid system\n * 2. The percentage and float left grid system\n * 3. The CSS grid system\n *\n * You can choose the one you want to use including corresponding mixins.\n *\n * It is highly customizable, you can customize:\n *\n * 1. Breakpoints\n * 2. Column count\n * 3. Seperator\n * 4. Column names\n * 5. Column gap\n *\n * @author Jack <jack.fu@cxagroup.com>\n * @version 0.0.1\n * @date Mon Nov 20 12:10:34 2017\n *\n * @import sass-mq/mq, midori/flex\n */\n\n$midori-grid-row-name: \"row\" !default;\n$midori-container-margin-right: auto !default;\n$midori-container-margin-left: auto !default;\n$midori-container-padding-right: 15px !default;\n$midori-container-padding-left: 15px !default;\n$midori-row-padding-left: -15px !default;\n$midori-row-padding-right: -15px !default;\n$midori-cell-padding-left: 15px !default;\n$midori-cell-padding-right: 15px !default;\n$default-word-column-names: one two three four five six seven eight nine ten eleven twelve;\n$default-number-column-names: 1 2 3 4 5 6 7 8 9 10 11 12;\n\n.midori-container-defaults {\n\theight: auto;\n\tmargin-right: $midori-container-margin-right;\n\tmargin-left: $midori-container-margin-left;\n\tpadding-right: $midori-container-padding-right;\n\tpadding-left: $midori-container-padding-left;\n}\n\n@mixin midori-container($break-points: (), $break-point-widths: ()) {\n\t@if length(map-keys($break-points)) > 0 {\n\t\t// We do have break points, it will act like the simple break container\n\t\t@each $key in map-keys($break-points) {\n\t\t\t$width: map-get($break-points, $key);\n\n\t\t\t@include mq($from: $width) {\n\t\t\t\twidth: map-get($break-point-widths, $key);\n\t\t\t}\n\t\t}\n\n\t\t$midori-container-mode: \"container\";\n\t}\n\t@else {\n\t\t// We don't have break points as input, it will act like container fluid\n\t\t$midori-container-mode: \"fluid\";\n\t}\n\n\t// We can include the contents now\n\t@content;\n}\n\n@mixin midori-grid-row-base {\n\tbox-sizing: border-box;\n\tmargin-right: $midori-row-padding-right;\n\tmargin-left: $midori-row-padding-left;\n\n\t// Let the row grow on it's flex direction\n\t@include midori-autoprefixer(flex-grow, 0);\n\n\t// This row will display as flex\n\t@include midori-flex-display;\n\n\t// Setup the flex properties of this row\n\t@include midori-flex(0 1 auto);\n\n\t// Make this row will wrap the contents\n\t@include midori-autoprefixer(flex-wrap, wrap);\n}\n\n@mixin midori-grid-row {\n\t@include midori-autoprefixer(flex-direction, row);\n\t@include midori-grid-row-base;\n\n\t@content;\n}\n\n@mixin midori-grid-row-reverse {\n\t@include midori-autoprefixer(flex-direction, row-reverse);\n\t@include midori-grid-row-base;\n\n\t@content;\n}\n\n@mixin midori-column-base {\n\t// Setup the flex properties of this column\n\t@include midori-flex(0 0 auto);\n\n\tbox-sizing: border-box;\n\tpadding-right: $midori-cell-padding-right;\n\tpadding-left: $midori-cell-padding-left;\n\n\t@content;\n}\n\n@mixin midori-column-settings {\n\tmax-width: 100%;\n\n\t@include midori-autoprefixer(flex-basis, 0);\n\t@include midori-autoprefixer(flex-grow, 1);\n}\n\n@mixin midori-flex-grid-column($width) {\n\t@include midori-column-base;\n\t@include midori-column-settings;\n\t@include midori-flex-width($width);\n}\n\n@mixin midori-flex-grid-generator($break-points: (), $prefix: col, $names: $default-word-column-names) {\n\t// Let's get the column count first\n\t$column-count: length($names);\n\n\t.#{$prefix} {\n\t\t@include midori-column-base;\n\t}\n\n\t@if length(map-keys($break-points)) > 0 {\n\t\t$keys: map-keys($break-points);\n\t\t$break-points-count: length($keys);\n\n\t\t@for $i from -1 * $column-count through -1 {\n\t\t\t$name: nth($names, abs($i));\n\t\t\t$from: null;\n\n\t\t\t@for $count from 1 through $break-points-count {\n\t\t\t\t$key: nth($keys, $count);\n\n\t\t\t\t@if abs($i) == 1 {\n\t\t\t\t\t// This is the first one\n\t\t\t\t\t@for $count from 1 through $column-count {\n\t\t\t\t\t\t.off-#{$key}-#{$count} {\n\t\t\t\t\t\t\tmargin-left: percentage($count / $column-count);\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\n\t\t\t\t\t.off-#{$key}-reset {\n\t\t\t\t\t\tmargin-left: 0;\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\t@if $count == 1 {\n\t\t\t\t\t.#{$prefix}-#{$key}-#{$name} {\n\t\t\t\t\t\t@include mq($until: map-get($break-points, $key)) {\n\t\t\t\t\t\t\t@include midori-flex-grid-column(abs($i) / $column-count);\n\t\t\t\t\t\t}\n\n\n\t\t\t\t\t\t@include mq($from: map-get($break-points, $key)) {\n\t\t\t\t\t\t\t@include midori-flex-grid-column(abs($i) / $column-count);\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t@else {\n\t\t\t\t\t.#{$prefix}-#{$key}-#{$name} {\n\t\t\t\t\t\t@include mq($from: $from, $until: map-get($break-points, $key)) {\n\t\t\t\t\t\t\t@include midori-flex-grid-column(abs($i) / $column-count);\n\t\t\t\t\t\t}\n\n\n\t\t\t\t\t\t@if $count == $break-points-count {\n\t\t\t\t\t\t\t// This is the last\n\t\t\t\t\t\t\t@include mq($from: map-get($break-points, $key)) {\n\t\t\t\t\t\t\t\t@include midori-flex-grid-column(abs($i) / $column-count);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\t// Update from\n\t\t\t\t$from: map-get($break-points, $key);\n\t\t\t}\n\t\t}\n\t}\n\t@else {\n\t\t$i: 1;\n\n\t\t@each $name in $names {\n\t\t\t.#{$prefix}-#{$name} {\n\t\t\t\t@include mq($from: map-get($brak-points, $key)) {\n\t\t\t\t\t@include midori-flex-grid-column($i / $column-count);\n\t\t\t\t}\n\t\t\t}\n\n\t\t\t// Let's create the offsets\n\t\t\t@for $count from 1 through $column-count {\n\t\t\t\t.off-#{$count} {\n\t\t\t\t\tmargin-left: percentage($count / $column-count);\n\t\t\t\t}\n\t\t\t}\n\n\t\t\t$i: $i + 1;\n\t\t}\n\t}\n\n\t.off-reset {\n\t\tmargin-left: 0;\n\t}\n}\n","/**\n * This is the test file for testing using webpack\n * \n * @import css/base, css/simple\n * @import css/wild(css/simple)\n * @import css/css-test\n * @import midori/grid\n */\n\nbody {\n\t@include simple;\n}\n"],"sourceRoot":""}]);

// exports
exports.locals = {
	"midori-container-defaults": "_simple-midori-container-defaults___25uDd"
};

/***/ }),
/* 5 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(7);


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--1-1!../../src/loader.js!./webpack.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--1-1!../../src/loader.js!./webpack.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(true);
// imports


// module
exports.push([module.i, "", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"webpack.scss","sourceRoot":""}]);

// exports


/***/ })
/******/ ]);
//# sourceMappingURL=webpack-test-bundle.js.map