/*
 * support.js — minimal DC (Design Component) runtime for standalone / GitHub Pages hosting.
 *
 * The *.dc.html files in this repo are exports from a proprietary "DC" design tool.
 * On that platform a runtime named support.js provides the <x-dc> template engine,
 * the DCLogic base class, and the {{ }} / <sc-for> / <sc-if> / <helmet> directives.
 * That runtime is NOT shipped with the exports, so the pages cannot render on plain
 * static hosting without it.
 *
 * This file reimplements just enough of that runtime, on top of React, to render the
 * four components in this repo. Key observations that make it small:
 *   - DCLogic maps almost 1:1 onto React.Component
 *     (state / setState / forceUpdate / componentDidMount / componentDidUpdate(pp,ps) /
 *      componentWillUnmount / renderVals()).
 *   - The components already expect a global `React`.
 *   - The <x-dc> template only uses inline `style`, `onClick`, `id`, plus the
 *     <sc-for>, <sc-if>, <helmet> directives and {{ expr }} interpolation.
 *
 * React, ReactDOM and THREE are vendored locally under vendor/ so the site is
 * self-contained (no CDN dependency). THREE is pre-set on window so the components'
 * `if (window.THREE)` fast-path skips their hard-coded CDN <script> injection.
 */
(function () {
  'use strict';

  // Hide the raw template immediately so un-rendered {{ }} markup never flashes.
  var hideStyle = document.createElement('style');
  hideStyle.textContent = 'x-dc,helmet{display:none!important}#dc-root{width:100%;height:100%;}html,body{height:100%;}';
  (document.head || document.documentElement).appendChild(hideStyle);

  var BASE = currentBase();
  function currentBase() {
    var s = document.currentScript;
    if (s && s.src) return s.src.replace(/[^/]*$/, '');
    return '';
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // ── 1. Load vendored React / ReactDOM / THREE, then boot ────────────────────
  var libs = Promise.resolve()
    .then(function () { return window.React ? null : loadScript(BASE + 'vendor/react.production.min.js'); })
    .then(function () { return window.ReactDOM ? null : loadScript(BASE + 'vendor/react-dom.production.min.js'); })
    .then(function () { return window.THREE ? null : loadScript(BASE + 'vendor/three.min.js').catch(function () { /* 3D optional */ }); });

  libs.then(function () { ready(boot); }).catch(function (e) { console.error('[DC] runtime load failed', e); });

  // ── 2. Expression / interpolation helpers ───────────────────────────────────
  var exprCache = {};
  function compileExpr(expr) {
    if (exprCache[expr]) return exprCache[expr];
    var fn;
    try {
      // Template content is authored by the same source as the component — trusted.
      fn = new Function('$s', 'with($s){ try { return (' + expr + '); } catch(e){ return undefined; } }');
    } catch (e) {
      fn = function () { return undefined; };
    }
    exprCache[expr] = fn;
    return fn;
  }
  function evalExpr(expr, scope) { return compileExpr(expr)(scope); }

  var LONE = /^\s*\{\{([\s\S]*?)\}\}\s*$/;
  // Single `{{ expr }}` (no surrounding text) → raw value (function / element / number / array).
  function interpRaw(str, scope) {
    var m = str.match(LONE);
    if (m) return evalExpr(m[1], scope);
    return interpStr(str, scope);
  }
  // Always a string; dynamic segments stringified.
  function interpStr(str, scope) {
    if (str.indexOf('{{') === -1) return str;
    return str.replace(/\{\{([\s\S]*?)\}\}/g, function (_, e) {
      var v = evalExpr(e, scope);
      return v == null ? '' : String(v);
    });
  }
  // For text nodes: returns an array of children (strings and/or raw values such as React elements).
  function compileText(str, scope) {
    var out = [], re = /\{\{([\s\S]*?)\}\}/g, last = 0, m;
    while ((m = re.exec(str))) {
      if (m.index > last) out.push(str.slice(last, m.index));
      var v = evalExpr(m[1], scope);
      if (v == null) { /* skip */ }
      else if (typeof v === 'object' || typeof v === 'function') out.push(v); // React element / array
      else out.push(String(v));
      last = re.lastIndex;
    }
    if (last < str.length) out.push(str.slice(last));
    return out;
  }

  // ── 3. Inline-style string → React style object ─────────────────────────────
  function camel(k) {
    k = k.trim();
    if (k.slice(0, 2) === '--') return k; // CSS custom property (React >=16.5 passes through)
    return k.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
  }
  function parseStyle(css) {
    var obj = {};
    if (!css) return obj;
    css.split(';').forEach(function (decl) {
      var i = decl.indexOf(':');
      if (i < 0) return;
      var key = decl.slice(0, i).trim();
      var val = decl.slice(i + 1).trim();
      if (!key) return;
      obj[camel(key)] = val;
    });
    return obj;
  }

  // ── 4. DOM template node → React element ────────────────────────────────────
  var React, ReactDOM;

  function childrenToReact(parent, scope, keyBase) {
    var out = [], kids = parent.childNodes;
    for (var i = 0; i < kids.length; i++) {
      var r = nodeToReact(kids[i], scope, keyBase + '_' + i);
      if (r == null) continue;
      if (Array.isArray(r)) { for (var j = 0; j < r.length; j++) if (r[j] != null) out.push(r[j]); }
      else out.push(r);
    }
    return out;
  }

  function nodeToReact(node, scope, key) {
    // Text
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (t.indexOf('{{') === -1) return t;
      return compileText(t, scope);
    }
    if (node.nodeType !== 1) return null; // comments etc.

    var tag = node.tagName.toLowerCase();
    if (tag === 'helmet') return null;

    if (tag === 'sc-for') {
      var arr = interpRaw(node.getAttribute('list') || '', scope);
      var asName = node.getAttribute('as') || 'item';
      if (arr == null) return null;
      if (!Array.isArray(arr)) arr = [].concat(arr);
      var frag = [];
      for (var a = 0; a < arr.length; a++) {
        var childScope = Object.create(scope);
        childScope[asName] = arr[a];
        childScope[asName + '_index'] = a;
        var kids = childrenToReact(node, childScope, key + '_' + a);
        for (var k = 0; k < kids.length; k++) frag.push(kids[k]);
      }
      return frag;
    }

    if (tag === 'sc-if') {
      var cond = interpRaw(node.getAttribute('value') || '', scope);
      if (!cond) return null;
      return childrenToReact(node, scope, key);
    }

    // Regular element
    var props = { key: key };
    var names = node.getAttributeNames ? node.getAttributeNames() : [];
    for (var n = 0; n < names.length; n++) {
      var name = names[n];
      var raw = node.getAttribute(name);
      if (name === 'hint-placeholder-count' || name === 'hint-placeholder-val') continue;
      if (/^on[a-z]/.test(name)) {
        var handler = interpRaw(raw, scope);
        if (typeof handler === 'function') {
          props['on' + name.charAt(2).toUpperCase() + name.slice(3)] = handler;
        }
      } else if (name === 'style') {
        props.style = parseStyle(interpStr(raw, scope));
      } else if (name === 'class') {
        props.className = interpStr(raw, scope);
      } else {
        props[name] = interpStr(raw, scope);
      }
    }

    var VOID = { br: 1, img: 1, input: 1, hr: 1, canvas: 0 };
    var children = VOID[tag] === 1 ? null : childrenToReact(node, scope, key);
    if (children && children.length === 0) children = null;
    return React.createElement(tag, props, children);
  }

  // ── 5. Boot: process helmet, eval component, mount ──────────────────────────
  var TEMPLATE_NODES = null;

  function renderTemplate(component) {
    var vals = {};
    try { vals = component.renderVals ? (component.renderVals() || {}) : {}; }
    catch (e) { console.error('[DC] renderVals threw', e); }
    var out = [];
    for (var i = 0; i < TEMPLATE_NODES.length; i++) {
      var r = nodeToReact(TEMPLATE_NODES[i], vals, 't' + i);
      if (r == null) continue;
      if (Array.isArray(r)) { for (var j = 0; j < r.length; j++) if (r[j] != null) out.push(r[j]); }
      else out.push(r);
    }
    return React.createElement(React.Fragment, null, out);
  }

  function boot() {
    React = window.React; ReactDOM = window.ReactDOM;
    if (!React || !ReactDOM) { console.error('[DC] React not available'); return; }

    var xdc = document.querySelector('x-dc');
    var scriptEl = document.querySelector('script[data-dc-script]');
    if (!xdc || !scriptEl) { console.error('[DC] <x-dc> or component script not found'); return; }

    // Helmet: relocate <link>/<style> to <head>. (Its <script src> tags were already
    // executed natively by the browser during parsing, so they are not re-run here.)
    var helmet = xdc.querySelector('helmet');
    if (helmet) {
      Array.prototype.slice.call(helmet.childNodes).forEach(function (node) {
        if (node.nodeType !== 1) return;
        var tn = node.tagName.toLowerCase();
        if (tn === 'link' || tn === 'style') document.head.appendChild(node.cloneNode(true));
      });
    }

    // Capture the template = top-level children of <x-dc> excluding <helmet>.
    TEMPLATE_NODES = Array.prototype.slice.call(xdc.childNodes).filter(function (node) {
      return !(node.nodeType === 1 && node.tagName.toLowerCase() === 'helmet');
    });

    // Remove the original <x-dc> from the document. The template markup contains
    // id="..." attributes (e.g. hw3d-wrap, topo-canvas) that the components look up
    // via document.getElementById(). If the (merely hidden) original stayed in the
    // DOM, getElementById would return that stale display:none node — sizing the
    // WebGL canvas to 0x0. The captured detached nodes are still readable for render.
    if (xdc.parentNode) xdc.parentNode.removeChild(xdc);

    // DCLogic ≈ React.Component; render() runs the captured template.
    var DCLogic = /** @class */ (function (_React) {
      function DCLogic(props) { return _React.Component.call(this, props) || this; }
      DCLogic.prototype = Object.create(_React.Component.prototype);
      DCLogic.prototype.constructor = DCLogic;
      DCLogic.prototype.renderVals = function () { return {}; };
      DCLogic.prototype.render = function () { return renderTemplate(this); };
      return DCLogic;
    })(React);
    window.DCLogic = DCLogic;

    // Evaluate the component class defined in <script type="text/x-dc">.
    var classText = scriptEl.textContent;
    var Component;
    try {
      Component = new Function('DCLogic', 'React', 'ReactDOM',
        classText + '\n;return Component;')(DCLogic, React, ReactDOM);
    } catch (e) {
      console.error('[DC] failed to evaluate component', e);
      return;
    }

    var container = document.createElement('div');
    container.id = 'dc-root';
    document.body.appendChild(container);

    var el = React.createElement(Component, {});
    if (ReactDOM.createRoot) ReactDOM.createRoot(container).render(el);
    else ReactDOM.render(el, container);
  }
})();
