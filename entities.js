(function () {
    'use strict';
    var text, entity,
        globalFunction, element, entityReferenceName, attPrefix,
        d = document,
        ct = 0,
        ifrs = [],
        scripts = document.getElementsByTagName('script'), // Doesn't need to be onload as only getting this script
        currentScriptURL = scripts[scripts.length-1].src,
        map = window.JSEntityMap || {},
        // Might want these next two configurable:
        metaHeadOnly = false, // True would be a little faster,
                                // but wouldn't allow users to define their own
                                // (e.g., within a comment or wiki system)
        entities,
        metas = (metaHeadOnly ? d.head : d).getElementsByTagName('meta');

    // PRIVATE STATIC UTILITIES
    /**
    * @private
    * @static
    */
    /*!
    * From: (c) 2012 Steven Levithan <http://slevithan.com/>
    * MIT License
    */
    if (!String.fromCodePoint) {
        /*!
        * ES6 Unicode Shims 0.1
        * (c) 2012 Steven Levithan <http://slevithan.com/>
        * MIT License
        */
        String.fromCodePoint = function fromCodePoint () {
            var chars = [], point, offset, units, i;
            for (i = 0; i < arguments.length; ++i) {
                point = arguments[i];
                offset = point - 0x10000;
                units = point > 0xFFFF ? [0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF)] : [point];
                chars.push(String.fromCharCode.apply(null, units));
            }
            return chars.join("");
        };
    }

    /**
    * Shim for IE7 (since we can't override prototype objects like Node or Element until IE8)
    * @see A full shim is available to handle style retrieval at {@link https://raw.github.com/termi/ES5-DOM-SHIM/0.8/__SRC/a.ielt8.js} (MIT license)
    * @private
    * @static
    */
    function _hasAttribute (el, name) {
        return el.getAttribute(name) !== null; // Despite earlier standard requiring empty string, this at least works in IE 10 using IE7-9 modes
    }

    /**
    * @private
    * @static
    */
    function preg_quote (str, delimiter) {
        // http://kevin.vanzonneveld.net
        return String(str).replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
    }

    /**
    * @private
    * @static
    */
    function getURLQueryParam (name) {
        var pattern = new RegExp('[?&]' + preg_quote(name) + '=([^&]*)(?:[&]|$)'),
            val = currentScriptURL.match(pattern);
        return val ? decodeURIComponent(val[1]) : null;
    }

    /**
    * @private
    * @static
    */
    function replaceNodeWithText (node, value) {
        node.parentNode.replaceChild(
                document.createTextNode(value),
                node
        );
    }

    function insertBeforeNodeWithText (node, value) {
        node.parentNode.insertBefore(
                document.createTextNode(value),
                node
        );
    }

    function setText (lookup) {
        if (!map[lookup]) {
            alert(
                'You must define an entity "' + lookup +
                '" within <meta> tags and/or define and add to a "JSEntityMap" JavaScript object variable.'
            );
            return false;
        }
        text = map[lookup];
        return true;
    }

    function replaceEntityText () {
        var scripts, i, sl, script, lookup;
        entities = d.getElementsByTagName(entityReferenceName);
        while (entities.length) {
            entity = entities[0];
            // One might add other conditions here to transform to different kinds of elements, etc. or
            //   allow a callback or two to check and define text or replacement node
            // The first two conditions are not very helpful since possible as HTML entities
            if (_hasAttribute(entity, attPrefix + 'dec')) {
                text = String.fromCodePoint(parseInt(entity.getAttribute(attPrefix+'dec'), 10));
            }
            else if (_hasAttribute(entity, attPrefix + 'hex')) {
                text = String.fromCodePoint(parseInt(entity.getAttribute(attPrefix+'hex'), 16));
            }
            else {
                lookup = _hasAttribute(entity, attPrefix + 'ent') ? entity.getAttribute(attPrefix + 'ent') :
                            entityReferenceName === 'data' ? false : entity.textContent || entity.innerText;
                if (lookup === false) { // Disallow plain <data> elements as could be used for other purposes
                    break;
                }
                if (!setText(lookup)) {
                    break;
                }
            }
            replaceNodeWithText(entity, text);
        }

        scripts = d.getElementsByTagName('script');
        for (i = 0, sl = scripts.length; i < sl; i++) {
            script = scripts[i];
            lookup = script.innerHTML.match(/^\s*e\(['"](\w+)['"]\)\s*$/);
            if (lookup) {
                setText(lookup[1]);
                // We do not replace the node, as replacing script apparently not allowed and messes up the loop
                insertBeforeNodeWithText(script, text);
            }
        }
    }

    function addMetasToMap (metas) {
        var i, metalen, pair, meta;
        for (i = 0, metalen = metas.length; i < metalen; i++) {
            meta = metas[i];
            if (_hasAttribute(meta, 'content') &&
                    _hasAttribute(meta, 'name') &&
                    meta.getAttribute('name') === 'entity'
                ) {
                pair = meta.getAttribute('content').split('=', 2);
                map[pair[0]] = pair[1];
            }
        }
    }

    function addListener (obj, type, listener) {
        if (obj.addEventListener) {
            obj.addEventListener(type, listener, false);
        }
        else {
            if (type === 'DOMContentLoaded') { // Older listener support in IE coincides with non-support of DOMContentLoaded
                type = 'load';
            }
            obj.attachEvent('on' + type, listener); // Todo: improve
        }
    }

    function addStylesheetRules (decls) {
        var s, i, dl, j, decl, selector, rulesStr, rl, rule, style = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(style);
        if (!window.createPopup) { /* For Safari */
           style.appendChild(document.createTextNode(''));
        }
        s = document.styleSheets[document.styleSheets.length - 1];
        for (i = 0, dl = decls.length; i < dl; i++) {
            j = 1;
            decl = decls[i];
            selector = decl[0];
            rulesStr = '';
            if (Object.prototype.toString.call(decl[1][0]) === '[object Array]') {
                decl = decl[1];
                j = 0;
            }
            for (rl = decl.length; j < rl; j++) {
                rule = decl[j];
                rulesStr += rule[0] + ':' + rule[1] + (rule[2] ? ' !important' : '') + ';\n';
            }

            if (s.insertRule) {
                s.insertRule(selector + '{' + rulesStr + '}', s.cssRules.length);
            }
            else { /* IE */
                s.addRule(selector, rulesStr, -1);
            }
        }
    }
    function entityIframeLoad (e) {
        ct++;
        var iwin = (e.target || e.srcElement).contentWindow,
            idoc = iwin.document,
            imetas = (metaHeadOnly ? idoc.head : idoc).getElementsByTagName('meta');
        addMetasToMap(imetas);
    }

    globalFunction = getURLQueryParam('global');
    element = getURLQueryParam('element');
    entityReferenceName = element || 'entity'; // could change to "data" for standard approach
    attPrefix = entityReferenceName === 'data' ? 'data-' : '';

    // IE will probably need this for styling unless using a standard element like <div> or <span>
    document.createElement(entityReferenceName);

    // Avoid need for defining styles to hide the meta iframes
    addStylesheetRules([['iframe[data-meta]', ['display', 'none']]]);

    // Requires that meta tags be placed above this script (added here
    //  so document.write method e() doesn't need to wait for page domcontentloaded,
    //  though called again by necessity if data-meta iframes detected)
    addMetasToMap(metas);

    // EVENT ATTACHMENT
    // Todo: Switch to a Window.prototype.addEventListener shim with this capability
    addListener(window, 'DOMContentLoaded', function () {
        var i, il, iframe, intrvl, iframes = d.getElementsByTagName('iframe');
        for (i = 0, il = iframes.length; i < il; i++) {
            iframe = iframes[i];
            if (_hasAttribute(iframe, 'data-meta')) {
                ifrs.push(iframe);
            }
        }

        if (!ifrs.length) { // There are no meta iframes, so no need to wait
            replaceEntityText();
        }
        else {
            intrvl = setInterval(function () {
                if (ct === ifrs.length) {
                    replaceEntityText();
                    clearInterval(intrvl);
                }
            }, 100);
        }
    });

    // EXPORTS
    if (globalFunction) {
        // Will not work with external files, as document.write operates immediately
        window[globalFunction] = function (lookup) {
            // Being handled elsewhere, but still need a function to keep it short (could do with script type) and explicit (could do with just string and no function call, but not clear for entities)
            // setText(lookup);
            // document.write(text);
        };
    }
    window.entityIframeLoad = entityIframeLoad; // Needed by IE which needs inline onload on iframes
}());
