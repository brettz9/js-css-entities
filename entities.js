(function () {
    // PRIVATE STATIC UTILITIES
    /**
    * @private
    * @constant
    */
    function fixedFromCharCode (codePt) {
        if (codePt > 0xFFFF) {
            codePt -= 0x10000;
            return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
        }
        else {
            return String.fromCharCode(codePt);
        }
    }
    
    /**
    * @private
    * @constant
    */
    function preg_quote (str, delimiter) {
        // http://kevin.vanzonneveld.net
        return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
    }

    /**
    * @private
    * @constant
    */
    function getURLQueryParam (name) {
        var pattern = new RegExp('[?&]' + preg_quote(name) + '=([^&]*)(?:[&]|$)');
        var value = currentScriptURL.match(pattern);
        return value ? decodeURIComponent(value[1]) : null;
    }
    
    /**
    * @private
    * @constant
    */
    function replaceNodeWithText (node, value) {
        node.parentNode.replaceChild(
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
        
        entities = d.getElementsByTagName(entityReferenceName);
        while (entities.length) {
            entity = entities[0];
            // One might add other conditions here to transform to different kinds of elements, etc. or
            //   allow a callback or two to check and define text or replacement node
            // The first two conditions are not very helpful since possible as HTML entities
            if (entity.hasAttribute(attPrefix+'dec')) {
                text = fixedFromCharCode(parseInt(entity.getAttribute(attPrefix+'dec'), 10));
            }
            else if (entity.hasAttribute(attPrefix+'hex')) {
                text = fixedFromCharCode(parseInt(entity.getAttribute(attPrefix+'hex'), 16));
            }
            else {
                lookup = entity.hasAttribute(attPrefix + 'ent') ? entity.getAttribute(attPrefix + 'ent') : 
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
    }

    function addMetasToMap (metas) {
        for (var i=0, metalen = metas.length; i < metalen; i++) {
            var pair, meta = metas[i];
            if (    meta.hasAttribute('content') && 
                    meta.hasAttribute('name') && 
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
            obj.attachEvent('on' + type, listener);
        }
    }

    function addStylesheetRules (decls) {
        var style = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(style);
        if (!window.createPopup) { /* For Safari */
           style.appendChild(document.createTextNode(''));
        }
        var s = document.styleSheets[document.styleSheets.length - 1];
        for (var i=0, dl = decls.length; i < dl; i++) {
            var j = 1, decl = decls[i], selector = decl[0], rulesStr = '';
            if (Object.prototype.toString.call(decl[1][0]) === '[object Array]') {
                decl = decl[1];
                j = 0;
            }
            for (var rl=decl.length; j < rl; j++) {
                var rule = decl[j];
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
    function entityIframeLoad (e) {;
        ct++;
        var iwin = (e.target || e.srcElement).contentWindow,
            idoc = iwin.document,
            imetas = (metaHeadOnly ? idoc.head : idoc).getElementsByTagName('meta');
        addMetasToMap(imetas);
    }
    
    var text, lookup, entity,
        d = document, 
        ct = 0,
        ifrs = [],
        scripts = document.getElementsByTagName('script'), // Doesn't need to be onload as only getting this script
        currentScriptURL = scripts[scripts.length-1].src,
        globalFunction = getURLQueryParam('global'),
        element = getURLQueryParam('element'),
        entityReferenceName =  element || 'entity', // could change to "data" for standard approach
        attPrefix = entityReferenceName === 'data' ? 'data-' : '',
        map = JSEntityMap ? JSEntityMap : {},
        // Might want these next two configurable:
        metaHeadOnly = false, // True would be a little faster, 
                                // but wouldn't allow users to define their own 
                                // (e.g., within a comment or wiki system)
        entities,
        metas = (metaHeadOnly ? d.head : d).getElementsByTagName('meta');
        
    // IE will probably need this for styling unless using a standard element like <div> or <span>
    document.createElement(entityReferenceName);

    // Avoid need for defining styles to hide the meta iframes
    addStylesheetRules([['iframe[data-meta]', ['display', 'none']]]);
    
    // Requires that meta tags be placed above this script (added here 
    //  so document.write method e() doesn't need to wait for page domcontentloaded,
    //  though called again by necessity if data-meta iframes detected)
    addMetasToMap(metas);
    
    // EVENT ATTACHMENT    
    addListener(this, 'DOMContentLoaded', function () {
        var iframes = d.getElementsByTagName('iframe');
        for (var i = 0, il = iframes.length; i < il; i++) {
            var iframe = iframes[i];
            if (iframe.hasAttribute('data-meta')) {
                ifrs.push(iframe);
            }
        }
        
        if (!ifrs.length) { // There are no meta iframes, so no need to wait
            replaceEntityText();
        }
        else {
            var intrvl = setInterval(function () {
                if (ct === ifrs.length) {
                    replaceEntityText();
                    clearInterval(intrvl);
                }
            }, 100);
        }
    });
    
    // EXPORTS
    if (globalFunction) {
        this[globalFunction] = function (lookup) {
            setText(lookup);
            document.write(text);
        };
    }
    this.entityIframeLoad = entityIframeLoad; // Needed by IE which needs inline onload on iframes
}());
