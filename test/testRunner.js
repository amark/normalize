/*

This code is exported from edide.

Source:
https://edide.io/htmlNormalizeUnitTests
https://edide.io/htmlNormalizeEditorTest

Look at the end of file for list of exported modules.

*/

var require = {};

require.editorModule = (function _editorModule (require) {
    // acces editor modules without requiring them
    // NOTE: if editor->edide, editorModule->edideModule
    var ref;

    return typeof file !== "undefined" && file !== null ? (ref = file.modules) != null ? ref.all : void 0 : void 0;

    return this;
}).call({}, require);

require.typeof = (function  (require) {
  // typeof with 'array' and 'null' types added
  return function(arg) {
  var type;
  type = typeof arg;
  if (type === 'object') {
    if (arg instanceof Array || ArrayBuffer.isView(arg)) {
      return 'array';
    }
    if (arg === null) {
      return 'null';
    }
  }
  return type;
  };

  return this;
}).call({}, require);

require.inEditor = (function _inEditor (require) {
  // Tells if the code is being executed in context of the editor.
  // (false indicating production environment)
  return typeof serverModule !== "undefined" && serverModule !== null;

  return this;
}).call({}, require);

require.catchError = (function _catchError (require) {
  return function(action, thisObj) {
  var err, ref;
  try {
    return action.call(thisObj);
  } catch (error) {
    err = error;
    if ((ref = require.editorModule) != null) {
      ref.editor_error.show(err);
    }
    return console.error(err);
  }
  };

  return this;
}).call({}, require);

require.unload = (function _unload (require) {Object.defineProperty(this, 'module_name', {value:'unload'});
  // Use @add to create unloadAction to be called on module unload.

  // Order of unloading modules is based on dependecy hierarcy,
  // so that modules at top hierarchy get unloaded before
  // modules below (see moduleExecTop).

  // Typically there is no need to define module and
  // in synchronous execution unloadAction will be bound to
  // currently executing module.

  // You may need to define the module when @add is called
  // asynchronously, for unloading to work properly.
  var unloading;

  unloading = false;

  this.add = (module, unloadAction) => {
  if (!require.inEditor) {
    return;
  }
  if (unloading) {
    throw Error("Cannot add new unload, when unloading in progress");
  }
  if (!unloadAction) {
    unloadAction = module;
    module = null;
  }
  if (module == null) {
    module = require.editorModule.executingModule;
  }
  if (module == null) {
    return this.addGlobal(unloadAction);
  }
  switch (require.typeof(module.unload)) {
    case 'array':
      module.unload.unshift(unloadAction);
      break;
    case 'function':
      // DEPRECATE
      module.unload = [module.unload.bind(module), unloadAction];
      break;
    default:
      module.unload = [unloadAction];
  }
  };

  // Rest of the methods are called by edide;
  // normally you only need to use @add

  // Global unloads are used in async code when module is not defined.
  if (this.global == null) {
  this.global = [];
  }

  this.addGlobal = (unloadAction) => {
  return this.global.unshift(unloadAction);
  };

  this.call = function(module) {
  var i, len, ref, unloadAction;
  unloading = true;
  switch (require.typeof(module.unload)) { // NOTE modules.all.typeof unmarked dependency
    case 'array':
      ref = module.unload;
      for (i = 0, len = ref.length; i < len; i++) {
        unloadAction = ref[i];
        require.catchError(unloadAction, module);
      }
      module.unload.length = 0;
      break;
    case 'function':
      // DEPRECATE
      require.editorModule.console.log(`WARNING: function unload in '${module.module_name}'`);
      require.catchError(module.unload, module);
  }
  return unloading = false;
  };

  this.callGlobalWithWait = async() => {
  var unloadAction;
  unloading = true;
  await Promise.all((function() {
    var i, len, ref, results;
    ref = this.global;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      unloadAction = ref[i];
      results.push(require.catchError(unloadAction, {}));
    }
    return results;
  }).call(this));
  this.global.length = 0;
  return unloading = false;
  };

  // DEPRECATE (replace with @callGlobalWithWait) ?
  this.callGlobal = () => {
  var i, len, ref, unloadAction;
  unloading = true;
  ref = this.global;
  for (i = 0, len = ref.length; i < len; i++) {
    unloadAction = ref[i];
    require.catchError(unloadAction, {});
  }
  this.global.length = 0;
  return unloading = false;
  };

  this.clear = (module) => {
  return module.unload = [];
  };

  return this;
}).call({}, require);

require.log = (function _log (require) {
  // production safe version of console log
  return function(...args) {
  var con, ref, ref1;
  con = (ref = (ref1 = require.editorModule) != null ? ref1.console : void 0) != null ? ref : console;
  return con.log(...args);
  };

  return this;
}).call({}, require);

require.argumentTypes = (function _argumentTypes (require) {
  // Transform arguments array to an object based on argument types,
  // allowing varying argument order.

  // You can use default name mapping, or give custom mapping.

  // When there are multiple arguments with same type, they are grouped
  // in an array (e.g. 'str' example). NOTE: don't use multiple array arguments!

  // DEPRECATE use of custom mapping and just do:
  // { fun, boo, str } = argumentTypes arguments
  // [funcProp, booleanVar, whatever] = [fun, boo, str]
  // OR.. make \:argTypes with just require.typeof instead of any mapping
  var defaultMapping;

  defaultMapping = {
  string: 'str',
  number: 'num',
  object: 'obj',
  array: 'arr',
  boolean: 'boo', // should be bool
  function: 'fun', // should be func
  undefined: 'nil',
  null: 'nil'
  };

  // rest: all non-defined types end up in rest (when own typeMapping used)
  return function(args, typeMapping = defaultMapping, defaultValues) {
  var arg, argTypes, current, i, key, len, ref, ref1, typeName, val;
  argTypes = {};
  for (i = 0, len = args.length; i < len; i++) {
    arg = args[i];
    typeName = (ref = (ref1 = typeMapping[require.typeof(arg)]) != null ? ref1 : typeMapping.rest) != null ? ref : 'rest';
    if (current = argTypes[typeName]) {
      if (Array.isArray(current)) {
        current.push(arg);
      } else {
        argTypes[typeName] = [argTypes[typeName], arg];
      }
    } else {
      argTypes[typeName] = arg;
    }
  }
  for (key in defaultValues) {
    val = defaultValues[key];
    if (argTypes[key] == null) {
      argTypes[key] = val;
    }
  }
  return argTypes;
  };

  return this;
}).call({}, require);

require.assert = (function _assert (require) {
  // Use to assert code validity
  // Arguments:
  //   boolean or function: result of assert (truthy is ok and falsy is error)
  //   string: error message
  // TODO: remove assert rows from code in tools/export
  var argMapping, assert;

  argMapping = {
  function: 'testFunc',
  string: 'errorMessage',
  //rest:     'result'
  boolean: 'result',
  object: 'debug',
  array: 'debug'
  };

  return assert = (...args) => {
  var debug, errorMessage, result, testFunc;
  //  throw 'depracated assert call' if arguments.length > 2
  ({result, testFunc, errorMessage, debug} = require.argumentTypes(args, argMapping));
  if (testFunc) {
    result = testFunc();
  }
  if (!result) {
    if (debug != null) {
      require.log('assert debug', debug);
    }
    throw Error(`assert failed: '${errorMessage}'`);
  }
  };

  // NOTE: requiring edit_debug would case endless require loop (without throwing an error)

  return this;
}).call({}, require);

require.str = (function _str (require) {Object.defineProperty(this, 'module_name', {value:'str'});
  // utility methods for strings
  // (the first argument is typically the string being modified)
  var ifs;

  this.if = ifs = function(arg, true_str, false_str) {
  if (true_str == null) {
    true_str = arg;
  }
  if (arg) {
    return true_str;
  } else {
    if (false_str != null) {
      return false_str;
    } else {
      return '';
    }
  }
  };

  this.capitalize = function(str) {
  return str[0].toUpperCase() + str.slice(1);
  };

  this.dasherize = function(str) {
  return str.replace(/([A-Z])/g, function(full, match) {
    return '-' + match.toLowerCase();
  }).replace(/ /g, '-');
  };

  // TODO \:speed_test comparison to:
  // @dasherize = (str)->
  //   str.replace /([A-Z ])/g, (full, match)->
  //     if match is ' '
  //     then '-'
  //     else '-' + match.toLowerCase()
  this.parsesToNumber = this.isNumber = function(str) {
  return !Number.isNaN(parseInt(str));
  };

  this.truncate = function(str, limit, truncStr = '...') {
  if (str.length > limit) {
    return str.slice(0, limit) + truncStr;
  } else {
    return str;
  }
  };

  // TODO: remove @titelize
  this.titleize = this.titelize = function(str) {
  return str.replace(/[-_]/g, ' ').replace(/(^| )(\w)/g, function(full, s, firstChar) {
    return s + firstChar.toUpperCase();
  }).replace(/(\w)([A-Z])/g, function(f, s, c) {
    return s + ' ' + c;
  });
  };

  //.replace(/ (\w)/g, (full,firstChar)-> ' ' + firstChar.toUpperCase())
  //str.titleize() # TODO: drom sugar req
  this.random = function(limit = 20) {
  return (Math.random() + '').slice(2, +(limit + 1) + 1 || 9e9);
  };

  this.remove = function(full, remove) {
  return full.replace(remove, '');
  };

  this.reverse = function(str) {
  return str.split("").reverse().join('');
  };

  return this;
}).call({}, require);

require.HTML = (function _HTML (require) {Object.defineProperty(this, 'module_name', {value:'HTML'});
  // HTML utility functions
  // (required from node_from_obj; try to keep small)
  this.eventAttrs = ['onKeyDown', 'onKeyUp', 'onKeyPress', 'onClick', 'onDoubleClick', 'onContextMenu', 'onBlur', 'onFocus', 'onLoad', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseDown', 'onMouseUp', 'onChange', 'onInput', 'onSubmit', 'onSelect', 'onDragEnter', 'onDragExit', 'onDragLeave', 'onDragOver', 'onDrag', 'onDragEnd', 'onDragStart', 'onDrop', 'onResize', 'onTouchStart', 'onTouchMove', 'onTouchEnd'];

  this.standardAttrs = [
  "accept",
  "action",
  "alt",
  "async",
  "checked",
  "class",
  "cols",
  "content",
  "controls",
  "coords",
  "data",
  "defer",
  "dir",
  "disabled",
  "download",
  "draggable",
  "form",
  "height",
  "hidden",
  "href",
  "icon",
  "id",
  "lang",
  "list",
  "loop",
  "manifest",
  "max",
  "media",
  "method",
  "min",
  "multiple",
  "muted",
  "name",
  "open",
  "pattern",
  "placeholder",
  "poster",
  "preload",
  "rel",
  "required",
  "role",
  "rows",
  "sandbox",
  "scope",
  "scrolling",
  "seamless",
  "selected",
  "shape",
  "size",
  "sizes",
  "spellcheck",
  "src",
  "start",
  "step",
  "style",
  "target",
  "title",
  "type",
  "value",
  "width",
  "wmode" // "span", "label",
  ];

  this.standardTags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'];

  this.condenseTags = function(htmlStr) { // remove empty space between tags
  return htmlStr.replace(/>( |\n)+<(\w)/g, function(full, content, char) {
    return '><' + char;
  });
  };

  // indent minified html
  this.prettify = function(htmlStr) {
  var indent;
  if (htmlStr instanceof Element) {
    htmlStr = htmlStr.outerHTML;
  }
  //console.log htmlStr
  indent = '';
  return htmlStr.replace(/<(\/)?[^>]+>/g, function(full, closing, pos) {
    var followingIsClosing, indentBeg, res;
    indentBeg = indent;
    if (closing) {
      followingIsClosing = htmlStr.slice(pos + full.length, +(pos + full.length + 1) + 1 || 9e9) === '</';
      indent = indent.substr(2);
      res = full + require.str.if(followingIsClosing, "\n" + indent);
    } else {
      indent += '  ';
      res = "\n" + indent + full;
    }
    return res;
  });
  };

  this.safeString = function(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  //.replace(/"/g, '&quot;').replace(/'/g, '&apos;') # " and ' replace not necessary?

  return this;
}).call({}, require);

require.stylesUtils = (function _stylesUtils (require) {Object.defineProperty(this, 'module_name', {value:'stylesUtils'});
  // TODO: make Set instead of array
  var vendors;

  this.non_pixel_props = ['font-weight', 'opacity', 'z-index', 'zoom'];

  vendors = (property_name, val) => {
  var i, len, obj, ref, vendor;
  obj = {};
  ref = ['webkit', 'moz', 'ms'];
  for (i = 0, len = ref.length; i < len; i++) {
    vendor = ref[i];
    obj[`-${vendor}-${property_name}`] = val;
  }
  obj[property_name] = val; // standard
  return obj;
  };

  this.sizeUnit = 'px'; // in the future move to em?

  this.create_property_string = (key, value) => {
  var val;
  // borderRadius -> border-radius
  key = key.replace(/[A-Z]/g, function(s) {
    return '-' + s.toLowerCase();
  });
  //key = key.replace(/_/g,'-') # DEPRECATED
  // 13 -> 13px
  if (typeof value === 'number' && this.non_pixel_props.indexOf(key) === -1) {
    value = `${value}${this.sizeUnit}`;
  }
  // "borderRadius -v" -> all verdor versions
  if (key.match(/ -v$/)) {
    key = key.slice(0, -3);
    return ((function() {
      var ref, results;
      ref = vendors(key, val);
      results = [];
      for (key in ref) {
        val = ref[key];
        results.push(`  ${key}: ${value};\n`);
      }
      return results;
    })()).join('');
  } else {
    return `  ${key}: ${value};\n`;
  }
  };

  //@sizeUnit = 'px'
  //@create_property_string = (key, value)->
  //  # borderRadius -> border-radius

  //  key = key.replace /[A-Z]/g, (s) -> '-' + s.toLowerCase()
  //  if typeof value is 'number' and @non_pixel_vars.indexOf(key) is -1
  //    value = "#{value}#{@sizeUnit}"
  //  if key.match ' -v'
  //    key = key.split(' ')[0]
  //    (for key, val of @vendors(key, val)
  //      "  #{key}: #{value};\n"
  //    ).join ''
  //  else
  //    "  #{key}: #{value};\n"

  return this;
}).call({}, require);

require.stylesInline = (function _stylesInline (require) {Object.defineProperty(this, 'module_name', {value:'stylesInline'});
  // inline styles from json

  // create style string to be added to
  this.fromObj = (stylesObj, styleStr = '') => {
  var addition, additions, i, key, len, ref, value;
  if (additions = stylesObj['&']) {
    ref = (Array.isArray(additions) ? additions : [additions]);
    for (i = 0, len = ref.length; i < len; i++) {
      addition = ref[i];
      styleStr += this.fromObj(addition);
    }
  }
  for (key in stylesObj) {
    value = stylesObj[key];
    if (key !== '&') {
      styleStr += require.stylesUtils.create_property_string(key, value);
    }
  }
  return styleStr;
  };

  // replace elements style with new style
  this.set = (element, stylesObj) => {
  return element.setAttribute('style', this.fromObj(stylesObj));
  };

  // concatenate new styles to elements current styles
  this.add = (element, stylesObj) => {
  var styleStr;
  styleStr = element.getAttribute('style') || '';
  return element.setAttribute('style', styleStr + this.fromObj(stylesObj));
  };

  this.addUnloading = (element, stylesObj) => {
  this.add(element, stylesObj);
  return require.unload.add(() => {
    var key;
    for (key in stylesObj) {
      element.style[key] = '';
    }
  });
  };

  return this;
}).call({}, require);

require.create_html_node = (function _create_html_node (require) {
  var create_html_node;

  return create_html_node = function(sKey = 'div') {
  var classes, domElName, el, idName, ref, ref1, ref2;
  domElName = ((ref = sKey.match(/^(h[1-6]|[^ #._0123456789]+)\d?/)) != null ? ref[1] : void 0) || 'div';
  idName = (ref1 = sKey.match(/#[^ ]+/)) != null ? ref1[0].slice(1) : void 0;
  classes = (ref2 = sKey.match(/\.[^ #.]+/g)) != null ? ref2.map(function(cStr) {
    return cStr.slice(1);
  }) : void 0;
  // create el
  el = document.createElement(domElName);
  if (idName != null) {
    el.id = idName;
  }
  if (classes != null ? classes.length : void 0) {
    el.setAttribute('class', classes.join(' '));
  }
  return el;
  };

  // do @test = ->
  //   node = create_html_node('.jii.jaa')
  //   node.innerHTML = 'joopa joo'
  //   #require.debug.txt '-'+node.className+'-'

  return this;
}).call({}, require);

require.object = (function _object (require) {Object.defineProperty(this, 'module_name', {value:'object'});
  // utility functions for object

  // TODO
  // go through all methods and move less common ones to \:keyval

  // helpers
  var identity;

  identity = function(el) {
  return el;
  };

  // methods

  //@clone   = _?.clone
  //@isEqual = _?.isEqual # deprecate; use \:isEqual

  // remove all children; more inefficient than creating new,
  // but necessary to retain object references
  this.dellAll = function(obj) {
  var key;
  for (key in obj) {
    delete obj[key];
  }
  };

  this.filter = function(obj, filterer) {
  var filtered, key, val;
  filtered = {};
  for (key in obj) {
    val = obj[key];
    if (filterer(key, val)) {
      filtered[key] = val;
    }
  }
  return filtered;
  };

  this.forEach = function(obj, func) {
  var key, val;
  for (key in obj) {
    val = obj[key];
    func(val, key);
  }
  };

  // Transfrom array to object with given key and value transfrom functions
  this.fromArray = function(array, valFromEl, keyFromEl) {
  var el, i, ind, len, obj;
  if (valFromEl == null) {
    valFromEl = identity;
  }
  if (keyFromEl == null) {
    keyFromEl = identity;
  }
  obj = {};
  for (ind = i = 0, len = array.length; i < len; ind = ++i) {
    el = array[ind];
    obj[keyFromEl(el, ind)] = valFromEl(el, ind);
  }
  return obj;
  };

  this.isObject = function(o) {
  return typeof o === 'object' && !Array.isArray(o) && o !== null;
  };

  // returns array
  this.map = function(obj, mapFunc) {
  var key, results, val;
  results = [];
  for (key in obj) {
    val = obj[key];
    results.push(mapFunc(val, key));
  }
  return results;
  };

  // returns object
  this.maps = function(obj, mapFuncs) {
  var key, newObj, val;
  require.assert("'mapFuncs' argument should include 'key' and/or 'val' transform functions", (mapFuncs.key != null) || (mapFuncs.val != null));
  if (mapFuncs.key == null) {
    mapFuncs.key = identity;
  }
  if (mapFuncs.val == null) {
    mapFuncs.val = identity;
  }
  newObj = {};
  for (key in obj) {
    val = obj[key];
    newObj[mapFuncs.key(key, val)] = mapFuncs.val(val, key);
  }
  return newObj;
  };

  // see also Object.assign (no IE support though)
  this.merge = function(first, ...rest) {
  var i, key, len, obj, val;
  for (i = 0, len = rest.length; i < len; i++) {
    obj = rest[i];
    for (key in obj) {
      val = obj[key];
      first[key] = val;
    }
  }
  return first;
  };

  this.mergeWary = function(first, ...rest) {
  var i, key, len, obj, val;
  for (i = 0, len = rest.length; i < len; i++) {
    obj = rest[i];
    for (key in obj) {
      val = obj[key];
      //key += ' ' while first[key]? # never ovewrite existing value
      if (first[key] == null) {
        first[key] = val;
      }
    }
  }
  return first;
  };

  this.mergeDeep = function(target, source) {
  var key, targetProp, val;
  for (key in source) {
    val = source[key];
    targetProp = target[key];
    if (this.isObject(targetProp) && this.isObject(val)) {
      this.mergeDeep(targetProp, val);
    } else {
      target[key] = val;
    }
  }
  return target;
  };

  this.eachDeep = function(rootObj, func, filter) {
  var depth, hasBeenExecuted, iterator;
  if (filter == null) {
    filter = function() {
      return true;
    };
  }
  depth = 1;
  hasBeenExecuted = new Map;
  iterator = function(obj, parent) {
    var key, val;
    if (hasBeenExecuted.get(obj)) {
      return;
    }
    hasBeenExecuted.set(obj, true);
  // iterate
    for (key in obj) {
      val = obj[key];
      if (!(filter(key, val, depth))) {
        continue;
      }
      if (typeof val === 'object') {
        depth++;
        iterator(val, obj);
        depth--;
      }
      func(key, val, parent);
    }
  };
  //hasBeenExecuted.delete obj # uncomment to skip only circular references
  iterator(rootObj);
  };

  this.select = function(obj, keysArr) {
  var i, key, len, newObj;
  newObj = {};
  for (i = 0, len = keysArr.length; i < len; i++) {
    key = keysArr[i];
    newObj[key] = obj[key];
  }
  return newObj;
  };

  this.values = function(obj) {
  var k, results, value;
  results = [];
  for (k in obj) {
    value = obj[k];
    results.push(value);
  }
  return results;
  };

  //Object.keys(obj).map (k)-> obj[k]

  //@entries = TODO {a:1, b:2} -> [['a',1], ['b', 2]] # https://github.com/es-shims/Object.entries

  return this;
}).call({}, require);

require.node_from_obj = (function _node_from_obj (require) {
  // parses DocumentFragment (DOM node collection) from object

  //# ATTRIBUTES

  // DIFFERENT from jsonHtml
  var allAttrActions, bindEvent, defaultAttrsMap, eventAttrsMap, iterate, node_from_obj, setAttribute, specialAttrsMap, stackDepth;

  bindEvent = function(attrName, attrVal, node) {
  var eventName;
  eventName = attrName.toLowerCase().slice(2);
  node.addEventListener(eventName, attrVal, false);
  if (node.listeners == null) {
    node.listeners = {};
  }
  if (node.listeners[attrName] != null) {
    throw "Event system don't allow binding two events of same type to same node";
  }
  // well, it could, but 'listeners' only remeber last one of them
  return node.listeners[eventName] = attrVal; //.bind(node)
  };

  setAttribute = function(attrName, attrVal, node) {
  if (attrVal != null) {
    return node.setAttribute(attrName, attrVal);
  }
  };

  defaultAttrsMap = require.object.fromArray(require.HTML.standardAttrs, function() {
  return setAttribute;
  });

  eventAttrsMap = require.object.fromArray(require.HTML.eventAttrs, function() {
  return bindEvent;
  });

  specialAttrsMap = {
  raw: function(attrName, attrVal, node) {
    return node.innerHTML = attrVal;
  },
  node: function(attrName, attrVal, node) {
    return node.appendChild(attrVal);
  },
  text: function(attrName, attrVal, node) {
    return node.textContent = attrVal;
  },
  styles: function(attrName, attrVal, node) {
    return require.stylesInline.set(node, attrVal); // attrVal is object with inline styles
  }
  };

  allAttrActions = require.object.merge(defaultAttrsMap, eventAttrsMap);

  require.object.merge(allAttrActions, specialAttrsMap);

  //# PARSER
  stackDepth = 0;

  iterate = function(node, val) {
  var attrName, i, key, len, nonStandard, subVal, tag;
  if (val == null) {
    return node;
  }
  if (stackDepth > 100) {
    stackDepth = 0;
    node_from_obj.error = {val, node};
    throw Error("node_from_obj stack depth > 100; endless loop?");
  }
  stackDepth++;
  if (typeof val === 'function') {
    val = val(node);
    if (val === node) { // it's common pattern to set (and return) node in some variable
      return;
    }
  }
  if (val instanceof Array) {
    for (i = 0, len = val.length; i < len; i++) {
      subVal = val[i];
      iterate(node, subVal); //, data
    }
  } else if (val instanceof Node) {
    node.appendChild(val);
  } else if (typeof val === 'object') {
    if (val.constructor !== Object) {
      throw Error('only basic object allowed in jsonHTML');
    }
  // key is val when 1 argument
    for (key in val) {
      subVal = val[key];
      if (allAttrActions[key] || (nonStandard = /^\w*[A-Z]/.test(key))) { // Why not /[A-Z]/ ?
        if (node.setAttribute == null) {
          throw new Error(`Can't set attributes ('${key}') for root list (${key})`);
        }
        if (nonStandard) {
          attrName = key.replace(/[A-Z]/g, function(match, ind) {
            return (require.str.if(ind !== 0, '-')) + match.toLowerCase(); // TODO: drop \:str dependency; how has ifs worked before??
          });
          setAttribute(attrName, subVal, node);
          nonStandard = null; // make sure this is re-evald when other attributes in same loop
        } else {
          allAttrActions[key](key, subVal, node);
        }
      } else if (key.match(/^me[0-9]?$/)) { // should this be dropped? (use array as parent instead)
        iterate(node, subVal);
      } else {
        // "normal" key, create tag and iterate children
        tag = require.create_html_node(key);
        iterate(tag, subVal);
        node.appendChild(tag);
      }
    }
  } else {
    node.textContent = val;
  }
  stackDepth--;
  return node;
  };

  // TODO: currently return must be the last expression
  // for requiring this module to work...
  return node_from_obj = function(tmplObj) {
  var fragment;
  // start iteration with empty fragment
  stackDepth = 0;
  fragment = iterate(document.createDocumentFragment(), tmplObj);
  //if fragment.children.length is 1
  //then fragment.children[0] # if only on
  //else fragment.children
  return fragment;
  };

  // OLD KEY CHECKING

  // check for special key (attributes, me, render)
  //       if key[0] is '_' # attrName value
  //         console.warn "node_from_obj _ attributes will deprecate"
  //         unless node.setAttribute?
  //           throw new Error "Can't set attributes for root list (#{key})"
  //         attrName = key.slice 1
  //         if eventAttrs.indexOf(attrName) isnt -1
  //           node.addEventListener attrName, subVal, false
  //         else switch attrName
  //           when 'raw' then node.innerHTML = subVal
  //           else node.setAttribute attrName, subVal

  return this;
}).call({}, require);

require.dom = (function _dom (require) {Object.defineProperty(this, 'module_name', {value:'dom'});
  // utility methods for manipulating DOM nodes

  // deprecate?
  this.addChilds = function(node, children) {
  var child, i, len, results;
  results = [];
  for (i = 0, len = children.length; i < len; i++) {
    child = children[i];
    results.push(node.appendChild(child));
  }
  return results;
  };

  this.childrenArray = function(node) {
  return Array.prototype.slice.call(node.children);
  };

  // deprecate?
  this.getAttr = function(node, attrName) {
  var val;
  val = node.attributes.getNamedItem(attrName).value;
  if (require.str.parsesToNumber(val)) {
    return parseFloat(val);
  } else {
    return val;
  }
  };

  this.get = function(selector, parentEl = document) {
  return parentEl.querySelector(selector);
  };

  this.getAll = function(selector, parentEl = document) {
  return parentEl.querySelectorAll(selector);
  };

  // deprecate?
  this.fragment = document.createDocumentFragment.bind(document);

  this.fromStr = (htmLStr) => {
  var div;
  div = document.createElement('div');
  div.innerHTML = htmLStr;
  return document.createDocumentFragment(div.children[0]);
  };

  this.fromStr("<p>foo</p><p>bar</p>");

  this.new = (nodeDef) => { //, props
  if (typeof nodeDef === 'object') {
    return require.node_from_obj(nodeDef).childNodes[0];
  } else {
    return require.create_html_node(nodeDef);
  }
  };

  //    return require.node_from_obj nodeDef)
  //  el =  nodeDef # document.createElement elType
  //  switch typeof props
  //    when 'string' then el.innerHTML = props
  //    when 'object' then require.object.merge el, props if props
  //  el

  // this is not very usefull.. mode elsewhere?
  this.append = this.addTo = this.appendTo = function(parent_element, content) {
  if (typeof content === 'object' && !(content instanceof Node)) {
    content = require.node_from_obj(content);
  }
  return parent_element.appendChild(content);
  };

  // this, though, is more useful
  this.prepend = function(parentEl, content) {
  if (typeof content === 'object') {
    content = require.node_from_obj(content);
  }
  return parentEl.insertBefore(content, parentEl.firstChild);
  };

  // IE supported way of removing element
  // (for chrome, firefox: el.remove())
  this.remove = function(element) {
  var parentEl;
  if (typeof element === 'string') {
    element = this.get(element);
  }
  if ((parentEl = element != null ? element.parentElement : void 0) != null) {
    return parentEl.removeChild(element);
  } else {
    return console.info("failed to remove node", element);
  }
  };

  this.removeChildren = function(node) {
  var results;
  results = [];
  while (node.firstChild) {
    results.push(node.removeChild(node.firstChild));
  }
  return results;
  };

  // TODO: this should be in \:render modulein
  this.render = function(node, htmlObj) {
  console.warn(":dom.render will deprecate");
  this.removeChildren(node);
  return node.appendChild(require.node_from_obj(htmlObj));
  };

  // TODO deprecate @replaceChilds
  this.replaceChildren = this.replaceChilds = function(node, newContent) {
  require.assert(node instanceof Element, 'requires DOM node');
  this.removeChildren(node);
  return this.append(node, newContent);
  };

  this.replace = function(oldEl, newEl) {
  var parentEl;
  if (typeof newEl === 'object') {
    newEl = require.node_from_obj(newEl);
  }
  if ((parentEl = oldEl.parentElement) != null) {
    parentEl.replaceChild(newEl, oldEl); // returns oldEl..
  } else {
    console.info("failed to replace node", newEl, oldEl);
  }
  return newEl; // don't work when newEl was object, since documentFragment will be empty
  };

  return this;
}).call({}, require);

require.randomId = (function _randomId (require) {
  return function() {
  return Math.random().toString().substr(2);
  };

  return this;
}).call({}, require);

require.coffee_styles = (function _coffee_styles (require) {Object.defineProperty(this, 'module_name', {value:'coffee_styles'});
  // ups to James Campos for original idea: https://github.com/aeosynth/ccss
  this.styleIdPostfix = '--styles';

  // TODO: move this to \:styles to allow adding CSS styles without this dependency
  this.addStyles = function(el_id, rules) {
  var cssStr, styleEl;
  if (typeof window === "undefined" || window === null) {
    return console.error("Trying to create StyleSheet rules on server side!");
  }
  if (arguments.length === 1) {
    rules = el_id;
    el_id = 'main';
  }
  // add styles post fix, since often the same id is used as with the component it styles
  el_id = el_id + this.styleIdPostfix;
  if (typeof rules === 'function') { //then rules.call(@helpers) else rules
    rules = rules();
  }
  this.stack = [];
  cssStr = typeof rules === 'object' ? this.compile(rules) : rules;
  styleEl = document.getElementById(el_id);
  if (styleEl == null) {
    styleEl = document.createElement('style');
    styleEl.id = el_id;
    document.head.appendChild(styleEl);
  }
  if (el_id === 'main_styles') {
    styleEl.innerHTML += cssStr;
  } else {
    styleEl.innerHTML = cssStr;
  }
  return styleEl;
  };

  this.compile = function(rulesObj) { // , styleSheet
  var childRules, childSelector, children, combineStr, cssStr, declarations, firstChar, i, j, key, len, len1, me, meRules, mixin, nested, newCSS, parentSelector, ref, ref1, selector, val, value;
  if (this.stack.indexOf(rulesObj) !== -1 || this.stack.length === 100) {
    console.warn('@stack', this.stack);
    throw Error("Endless stack ccss.compile_to_str!");
  }
  this.stack.push(rulesObj);
  cssStr = '';
  for (selector in rulesObj) {
    childRules = rulesObj[selector];
    declarations = '';
    nested = {};
    // media queries  TODO: implement also in jsonCss
    if (selector.slice(0, 1) === '@') {
      cssStr += selector + ' { \n';
      cssStr += this.compile(childRules);
      return cssStr + '}\n';
    }
    // merge mixin(s)
    // DEPRECATE mixin -> me
    while ((childRules != null ? childRules.mixin : void 0) || (childRules != null ? childRules.me : void 0)) {
      ({mixin, me} = childRules);
      childRules.mixin = null;
      childRules.me = null;
      meRules = Object.assign({}, mixin, me);
      for (key in meRules) {
        val = meRules[key];
        if (childRules[key] == null) {
          childRules[key] = val; // mixins don't overwrite existing definitions
        }
      }
    }
  // umm.. should have "childRules = childRules?.me" here for while to work..?

  //a pair is either a css declaration, or a nested rule
    for (key in childRules) {
      value = childRules[key];
      if (typeof value === 'object') {
        children = [];
        ref = key.split(/\s*,\s*/);
        for (i = 0, len = ref.length; i < len; i++) {
          childSelector = ref[i];
          ref1 = selector.split(/\s*,\s*/);
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            parentSelector = ref1[j];
            firstChar = childSelector.slice(0, 1);
            combineStr = (function() {
              switch (firstChar) {
                case ':':
                  return '';
                case '&':
                  childSelector = childSelector.slice(1);
                  return '';
                default:
                  return ' ';
              }
            })();
            children.push(parentSelector + combineStr + childSelector);
          }
        }
        nested[children.join(',')] = value;
      } else {
        declarations += require.stylesUtils.create_property_string(key, value);
      }
    }
    if (declarations.length) {
      newCSS = `${selector} {\n${declarations}}\n`;
      try {
        cssStr += newCSS;
      } catch (error) {
        console.log("failed with ", newCSS);
        return;
      }
    }
    cssStr += this.compile(nested); //, styleSheet
  }
  return cssStr;
  };

  return this;
}).call({}, require);

require.rootElement = (function _rootElement (require) {Object.defineProperty(this, 'module_name', {value:'rootElement'});
  // Root DOM container to render content in
  if (require.inEditor) {
  if (this.node == null) {
    this.node = document.createElement('div');
  }
  this.node.id = 'right_side';
  this.selector = '#' + this.node.id;
  } else {
  this.selector = 'body';
  this.node = document.querySelector(this.selector);
  }

  //if require.inEditor
  //then require.editorModule?.render_editor.on 'rendered', @init
  //else @init()

  return this;
}).call({}, require);

require.isModule = (function _isModule (require) {
  return function(maybeModule) {
  return typeof (maybeModule != null ? maybeModule.module_name : void 0) === 'string';
  };

  return this;
}).call({}, require);

require.styles = (function _styles (require) {Object.defineProperty(this, 'module_name', {value:'styles'});
  // LOAD HANDLER
  if (this.addedStyles == null) {
  this.addedStyles = {};
  }

  // scope styles with ID of given module's name
  this.addScoped = function(module, stylesObj) {
  stylesObj = {
    [`#${module.module_name}`]: stylesObj
  };
  return this.add(module, stylesObj);
  };

  this.addRoot = function(stylesObj) {
  return this.add({
    [`${require.rootElement.selector}`]: stylesObj
  });
  };

  this.editorSelector = "#editor_top, #left_side, #popup-windows";

  this.addEditor = (stylesObj) => {
  return this.add({
    [`${this.editorSelector}`]: stylesObj
  });
  };

  this.add = function(modOrId, jsonCss) {
  var id, unload;
  if (arguments.length === 1) {
    jsonCss = modOrId;
    id = 's' + require.randomId();
  } else if (require.isModule(modOrId)) {
    id = modOrId.module_name;
  } else if (typeof modOrId === 'string') {
    id = modOrId;
    unload = false; // !! to disable unloading, provide string ID
  } else {
    throw Error("invalid arguments to styles");
  }
  if (unload == null) {
    unload = true;
  }
  this.addedStyles[id] = require.coffee_styles.addStyles(id, jsonCss);
  if (unload) {
    return require.unload.add(() => {
      return this.remove(id);
    });
  }
  };

  this.addRoot = function(jsonCss) {
  jsonCss = { //  > *
    [`${(require.inEditor ? '#right_side' : 'body')}`]: jsonCss
  };
  return this.add(jsonCss);
  };

  // @oldAdd = ->
  //   { str, obj, boo } = require.argumentTypes arguments
  //   [id, unload, jsonCss] = [str, boo, obj]
  //   unload ?= true
  //   id ?= 's' + require.randomId()
  //   @addedStyles[id] =
  //     require.coffee_styles.addStyles id, jsonCss
  //   if unload
  //     require.unload.add => @remove id
  this.parseNode = function(dom_element_style_definitions) {};

  this.clear = function() { // umm, this isn't very usefull
  var idStr, results;
  results = [];
  for (idStr in this.addedStyles) {
    results.push(this.remove(idStr));
  }
  return results;
  };

  // @remove DOM style elements from head
  this.remove = (idStr) => { // idStr == parent module name
  var i, len, ref, styleEl;
  if (!idStr) {
    return;
  }
  ref = document.querySelectorAll(`head #${idStr}${require.coffee_styles.styleIdPostfix}`);
  for (i = 0, len = ref.length; i < len; i++) {
    styleEl = ref[i];
    require.dom.remove(styleEl);
  }
  return delete this.addedStyles[idStr];
  };

  // @add = (idOrModule, objOrCssStr)->
  //   if arguments.length is 1
  //     objOrCssStr = idOrModule
  //     idOrModule = require.editorModule.executingModule.module_name
  // #     unload = false
  // #   else
  //   unload = true
  //   if require.typeof(idOrModule) is 'object'
  //     module = idOrModule
  //     idOrModule = idOrModule.module_name
  //   throw Error "\:styles.add require id string" unless typeof idOrModule is 'string'
  //   @addedStyles[idOrModule] = true
  //   require.coffee_styles.addStyles idOrModule, objOrCssStr
  //   #module ?= require.editorModule.executingModule
  //   #unless require.isModule module
  //   #    debugger
  //   if unload
  //     require.unload.add => @remove idOrModule

  return this;
}).call({}, require);

require.computedStyle = (function _computedStyle (require) {Object.defineProperty(this, 'module_name', {value:'computedStyle'});
  var pxVal;

  this.styles;

  this.fromElement = function(element) {
  return this.styles = window.getComputedStyle(element);
  };

  pxVal = (propName) => {
  return parseFloat(this.styles[propName]);
  };

  this.getHorPadding = function() {
  return pxVal('padding-left') + pxVal('padding-right');
  };

  this.getVertPadding = function() {
  return pxVal('padding-top') + pxVal('padding-bottom');
  };

  this.getHorMargin = function() {
  return pxVal('margin-left') + pxVal('margin-right');
  };

  this.getVertMargin = function() {
  return pxVal('margin-top') + pxVal('margin-bottom');
  };

  return this;
}).call({}, require);

require.aspectRatio = (function _aspectRatio (require) {Object.defineProperty(this, 'module_name', {value:'aspectRatio'});
  this.setContainer = function(containerWidth, containerHeight) {
  var container, paddingHor, paddingVert;
  this.containerWidth = containerWidth;
  this.containerHeight = containerHeight;
  if (this.containerWidth instanceof Node) {
    container = this.containerWidth;
    require.computedStyle.fromElement(container);
    //styles = window.getComputedStyle container
    paddingHor = require.computedStyle.getHorPadding(); // parseInt(styles['padding-left']) + parseInt(styles['padding-right'])
    paddingVert = require.computedStyle.getVertPadding(); // parseInt(styles['padding-top']) + parseInt(styles['padding-bottom'])
    this.containerWidth = container.clientWidth - paddingHor;
    this.containerHeight = container.clientHeight - paddingVert;
  }
  return this;
  };

  this.fitInCointainer = function(widthToHeight) {
  if (this.containerHeight > this.containerWidth / widthToHeight) {
    this.width = this.containerWidth;
    this.height = this.containerWidth / widthToHeight;
  } else {
    this.height = this.containerHeight;
    this.width = this.containerHeight * widthToHeight;
  }
  return [this.width, this.height];
  };

  return this;
}).call({}, require);

require.stylesBase = (function _stylesBase (require) {Object.defineProperty(this, 'module_name', {value:'stylesBase'});
  this.def = {
  '*': {
    position: 'relative', // TODO: does this affect rendering speed?
    boxSizing: 'border-box'
  },
  // DEFAUL ELEMENT STYLES
  body: {
    margin: 0
  },
  'h1, h2, h3, h4, h5, h6': {
    margin: 0
  },
  'a, button': {
    cursor: 'pointer'
  }
  };

  require.styles.add('stylesBase', this.def);

  return this;
}).call({}, require);

require.moduleName = (function _moduleName (require) {
  return function(nameOrMod) {
  if (typeof nameOrMod === 'string') {
    return nameOrMod;
  } else {
    return nameOrMod != null ? nameOrMod.module_name : void 0;
  }
  };

  return this;
}).call({}, require);

require.editor_sizes = (function _editor_sizes (require) {Object.defineProperty(this, 'module_name', {value:'editor_sizes'});
  this.editorFont = 11; // normally 10

  this.uiFont = 12;

  this.topRowHeight = 26;

  return this;
}).call({}, require);

require.editor_colors = (function _editor_colors (require) {Object.defineProperty(this, 'module_name', {value:'editor_colors'});
  this.purple = 'hsl(261, 90%, 75%)';

  this.blue = 'hsl(203, 90%, 63%)';

  this.turcose = "hsl(170, 90%, 50%)";

  this.green = "hsl(90, 75%, 50%)";

  this.green_hover = "hsl(90, 100%, 70%)";

  this.yellow = 'hsl(57, 72%, 65%)';

  this.orange = 'hsl(37, 100%, 56%)';

  this.red = 'hsl(19, 100%, 56%)';

  this.unhued_red = 'hsl(337, 100%, 56%)';

  this.gray = 'hsl(50, 11%, 55%)';

  this.white = 'hsl(0,0%,90%)';

  this.bgHue = 70;

  this.bgSaturation = 8;

  this.black = `hsl(${this.bgHue}, 8%, 12%)`;

  this.uiGreen = "hsl(130,70%,43%)"; //require.color.hsl 130, 70, 43

  this.uiRed = "hsl(0,80%,43%)"; //require.color.hsl 0,   80, 43

  this.uiRedDim = "hsl(0,50%,43%)"; //require.color.hsl 0,   50, 43 # remove and use opacity instead?

  this.withOpacity = (colorName, opacity) => {
  var hslaColor;
  require.assert((hslaColor = this[colorName]) != null);
  return 'hsla' + hslaColor.slice(3, -1) + `, ${opacity})`;
  };

  return this;
}).call({}, require);

require.layersStyles = (function _layersStyles (require) {Object.defineProperty(this, 'module_name', {value:'layersStyles'});
  var height, id;

  id = 'layer';

  height = function() {
  //   if require.inEditor
  //   then "calc(100% - #{require.editor_sizes.modulesInfoHeight}px)"
  //   else '100%'
  return '100%';
  };

  this.init = (selector) => {
  this.selector = selector;
  return this.normal();
  };

  this.normal = () => { // don't recreate unnecessarily since \ require.unload would rebind it
  return require.styles.add(id, {
    [`${this.selector}`]: {
      fontFamily: 'Arial',
      background: require.editor_colors.black,
      width: '100%',
      height: height(),
      overflow: 'hidden',
      pointerEvents: 'none',
      '& > *': {
        pointerEvents: 'all',
        position: 'absolute',
        //'&:first-child': position: 'static'
        // OR: '&:last-child': position: 'static'
        top: '0',
        left: '0',
        overflowY: 'auto',
        '&:not(canvas)': {
          height: '100%',
          width: '100%'
        }
      },
      '& > canvas': this.canvasProps = {
        overflowY: 'hidden',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }
  });
  };

  this.fullwindow = function() {
  return require.styles.add(id, {
    [`${this.selector}`]: {
      width: '100%',
      height: height(),
      overflow: 'hidden',
      pointerEvents: 'none',
      '& > *': {
        pointerEvents: 'all',
        position: 'absolute',
        overflow: 'hidden',
        top: '0',
        left: '0',
        height: '100vh',
        width: '100vw'
      },
      '& > canvas': {
        transform: 'translate(-50%, 0)'
      }
    }
  });
  };

  // not used... (not very layer like)
  this.scroll = function(activeModule) {
  require.styles.remove(id);
  require.styles.add(id, {
    [`${this.selector}`]: {
      overflowY: 'scroll'
    }
  });
  return require.unload.add(this.normal);
  };

  this.none = function() { // activeModule
  //throw Error "add caller module" unless activeModule
  require.styles.remove(id);
  // return normal styles when module unloaded:
  return require.unload.add(this.normal);
  };

  return this;
}).call({}, require);

require.layers = (function _layers (require) {Object.defineProperty(this, 'module_name', {value:'layers'});
  var initContainer;

  this.prodStyles = function(prod = true) {
  var ref;
  return (ref = require.editorModule) != null ? ref.dark_theme.init(prod) : void 0;
  };

  this.selector = '#layers';

  require.layersStyles.init(this.selector);

  require.stylesBase;

  initContainer = () => {
  var ref;
  return (ref = require.rootElement.node.querySelector(this.selector)) != null ? ref : require.rootElement.node.appendChild(require.dom.new(this.selector));
  };

  this.init = () => {
  if (this.container != null) {
    //debugger
    return this;
  }
  this.container = initContainer();
  this.addedLayers = new Map; // {} # TODO: change these to map's -
  this.canvases = new Map; // {} not bound to module_name's
  require.unload.add(() => {
    //debugger
    require.dom.remove(this.container);
    return this.container = null;
  });
  return this;
  };

  this.get = function(layerId, elementType = 'div') {
  var module, node;
  this.init();
  if (require.isModule(layerId)) {
    module = layerId;
    layerId = require.moduleName(module);
  }
  // TEMP assertion:
  //     { executingModule } = require.editorModule
  //     if executingModule and module isnt executingModule
  //       debugger
  if (layerId && (node = this.addedLayers.get(layerId))) { // @addedLayers[layerName]
    return node;
  }
  if (layerId == null) {
    layerId = 'l' + require.randomId(); // by creating new id we allow multiple renders when id not provided
  }
  node = document.createElement(elementType);
  node.className = 'layer';
  node.id = layerId;
  this.container.appendChild(node);
  this.addedLayers.set(layerId, node); //[layerName] = node
  require.unload.add(() => {
    return this.remove(layerId);
  });
  return node;
  };

  // TODO: getFixedCanvas (uses aspect ratio), getFittedCanvas (width = container width)
  // and getCanvas should fit to itself
  this.getCanvas = (nameOrMod, widthToHeight, ctxType = '2d') => {
  var canvasProps, el, ref, ref1;
  //if require.typeof(nameOrMod) is 'object'
  if (require.inEditor) {
    if ((ref = require.editorModule) != null) {
      if ((ref1 = ref.executingModule) != null) {
        if (ref1.recompileOnResize == null) {
          ref1.recompileOnResize = true;
        }
      }
    }
  }
  el = this.get(nameOrMod, 'canvas');
  if (widthToHeight != null) {
    require.aspectRatio.setContainer(this.container);
    [el.width, el.height] = require.aspectRatio.fitInCointainer(widthToHeight);
  } else {
    el.width = this.container.clientWidth;
    el.height = this.container.clientHeight;
  }
  canvasProps = {
    node: el,
    ctx: el.getContext(ctxType, {
      preserveDrawingBuffer: true
    }),
    width: el.width,
    height: el.height,
    widthToHeight: widthToHeight
  };
  this.canvases.set(require.moduleName(nameOrMod), canvasProps);
  return canvasProps;
  };

  this.has = function(layerId) {
  return this.addedLayers.has(require.moduleName(layerId)); //[require.moduleName layerId]?
  };

  this.remove = (layerId) => {
  var node;
  layerId = layerId instanceof Element ? layerId.id : require.moduleName(layerId);
  if (node = this.addedLayers.get(layerId)) {
    this.addedLayers.delete(layerId);
    this.canvases.delete(layerId);
    require.dom.remove(node);
  }
  };

  this.clear = () => {
  return this.addedLayers.forEach((node, layerId) => {
    return this.remove(layerId);
  });
  };

  // NOT WORKING, not used
  if (this.refresh == null) {
  this.refresh = (runModule) => {
    // canvas resolutions
    require.aspectRatio.setContainer(this.container);
    return this.addedLayers.forEach((node, name) => {
      //for name, node of @addedLayers
      if (node.tagName === 'CANVAS') {
        if (this.canvases.get(name).widthToHeight != null) {
          return [node.width, node.height] = require.aspectRatio.fitInCointainer(this.canvases.get(name).widthToHeight);
        } else {
          node.width = this.container.clientWidth;
          return node.height = this.container.clientHeight;
        }
      }
    });
  };
  }

  return this;
}).call({}, require);

require.render = (function _render (require) {Object.defineProperty(this, 'module_name', {value:'render'});
  this.toNode = function(node, htmlObjOrNode) {
    var newNode;
    require.dom.removeChildren(node);
    newNode = htmlObjOrNode instanceof Node ? htmlObjOrNode : require.node_from_obj(htmlObjOrNode);
    node.appendChild(newNode);
    return node;
  };

  this.toLayer = function(module, htmlObjOrNode) {
    if (!htmlObjOrNode) {
      htmlObjOrNode = module;
      module = null;
    }
    return this.toNode(require.layers.get(module), htmlObjOrNode);
  };

  this.html = (htmlStr) => {
    require.rootElement.node.innerHTML = htmlStr;
    return require.unload.add(() => {
      require.dom.removeChildren(require.rootElement.node);
      return require.layers.init();
    });
  };

  // deprecate / move elsewhere?
  this.late = function(moduleOrNode, htmlObjFunc) {
    var func;
    func = moduleOrNode instanceof Node ? this.toNode : this.toLayer.bind(this);
    // TODO: setTimout is dangerous, should bind to 'recompile' event?
    return setTimeout(function() {
      return func(moduleOrNode, htmlObjFunc());
    });
  };

  return this;
}).call({}, require);



require.htmlNormalizeUnitTests = (function _htmlNormalizeUnitTests (require) {
  var methods, ref, render;

  if ((ref = require.editorModule) != null) {
    ref.console.maxResultRows = 60;
  }

  methods = [
  {
    name: "Current",
    func: (...args) => {
      return $.normalize(...args); //require.HTML.condenseTags
    }
  }
  ];

  render = (tests) => {
  var method, res, test;
  return require.render.toLayer('htmlNormalizeUnitTests', (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = methods.length; i < len; i++) {
        method = methods[i];
        results.push({
          h2: method.name,
          '.rows.title': {
            div: "Input",
            div2: "Expected",
            div3: "Result"
          },
          me: (function() {
            var j, len1, results1;
            results1 = [];
            for (j = 0, len1 = tests.length; j < len1; j++) {
              test = tests[j];
              res = method.func(test.in, test.opt);
              results1.push({
                '.subtitle': test.name + (test.opt ? ` [${Object.keys(test.opt)}]` : ''),
                'div.rows': {
                  'pre.in': test.in,
                  'pre.out': test.out,
                  'pre.result': res === test.out ? {
                    '.pass': 'PASS'
                  } : {
                    '.fail': res
                  }
                }
              });
            }
            return results1;
          })()
        });
      }
      return results;
    })());
  };

  require.styles.add({
    'body': {
      background: require.editor_colors.black,
      margin: '1em'
    },
    '#layers': {
      color: 'white',
      padding: '1em'
    }
  });

  require.styles.addScoped({ module_name: 'htmlNormalizeUnitTests' }, {
    '.rows': {
      display: 'grid',
      gridTemplateColumns: "32% 32% 32%",
      margin: '1em 0',
      gridColumnGap: '2%',
      "&:not(.title) > *": {
        minHeight: '2.5em',
        overflowX: 'scroll'
      }
    },
    '.pass': {
      color: 'green'
    },
    '.fail': {
      color: 'red'
    },
    'pre': {
      margin: 0
    },
    '.subtitle': {
      marginBottom: '-0.7em',
      fontWeight: 'bold'
    }
  });

  return (tests, fullRow) => {
  if (fullRow) {
    require.styles.add('normFullRow', {
      '#htmlNormalizeUnitTests .rows': {
        display: 'block !important',
        ':not(.title) > *': {
          minHeight: 'auto !important',
          margin: '0.8em 0 !important'
        }
      }
    });
  } else {
    require.styles.remove('normFullRow');
  }
  return render(tests);
  };

}).call({}, require);

require.requireStylesheet = (function _requireStylesheet (require) {
  // TODO: defaults, attribute options
  return (src, unload = true) => {
    var el;
    if (document.head.querySelector(`[href='${src}']`)) {
      return;
    }
    el = document.createElement('link');
    el.rel = 'stylesheet';
    el.type = 'text/css'; // media="screen" charset="utf-8"
    el.media = 'screen';
    el.charset = 'utf-8';
    el.href = src;
    document.head.appendChild(el);
    if (unload) {
      return require.unload.add(() => {
        return document.head.removeChild(el);
      });
    }
  };
}).call({}, require);

require.scriptContainer = (function _scriptContainer (require) {
  var ref;
  return (ref = require.dom.get('#scripts')) != null ? ref : document.body.appendChild(require.dom.new('#scripts'));
}).call({}, require);

require.requireScript = (function _requireScript (require) {
  if (window.requireScriptPromises == null) {
    window.requireScriptPromises = new Map;
  }

  return (scriptSrc) => {
    var promise;
    if (promise = requireScriptPromises.get(scriptSrc)) {
      return promise;
    } else {
      requireScriptPromises.set(scriptSrc, promise = new Promise((resolve) => {
        var el;
        console.log('adding promised', scriptSrc);
        el = document.createElement('script');
        require.scriptContainer.appendChild(el);
        el.onload = resolve; //load_ready
        el.type = 'application/javascript';
        return el.src = scriptSrc;
      }));
      return promise.catch((err) => {
        require.showError(err);
        return requireScriptPromises.delete(scriptSrc);
      });
    }
  };
}).call({}, require);


var { htmlNormalizeUnitTests, requireStylesheet, requireScript, render, styles, str } = require;
export { htmlNormalizeUnitTests, requireStylesheet, requireScript, render, styles, str };
