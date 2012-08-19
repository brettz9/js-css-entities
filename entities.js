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
            return;
        }
        text = map[lookup];
    }
    
    var text, lookup, entity,
        d = document, 
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

    // Requires that meta tags be placed above this script (added here 
    //  so document.write method e() doesn't need to wait for page domcontentloaded)
    Array.prototype.forEach.call(metas, function (meta) { // Shortcut Array.forEach() not currently supported in Chrome
        var pair;
        if (    meta.hasAttribute('content') && 
                meta.hasAttribute('name') && 
                meta.getAttribute('name') === 'entity'
            ) {
            pair = meta.getAttribute('content').split('=', 2);
            map[pair[0]] = pair[1];
        }
    });
    
    // EVENT ATTACHMENT
    this.addEventListener('DOMContentLoaded', function () {
        
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
                lookup = entity.hasAttribute(attPrefix+'ent') ? entity.getAttribute(attPrefix+'ent') : 
                            entityReferenceName === 'data' ? false : entity.textContent;
                if (lookup === false) { // Disallow plain <data> elements as could be used for other purposes
                    break;
                }
                setText(lookup);
            }
            replaceNodeWithText(entity, text);
        };
    });
    
    // EXPORTS
    if (globalFunction) {
        this[globalFunction] = function (lookup) {
            setText(lookup);
            document.write(text);
        };
    }
}());
