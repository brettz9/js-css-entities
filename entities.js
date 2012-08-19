(function () {
    // PRIVATE UTILITIES
    function fixedFromCharCode (codePt) {
        if (codePt > 0xFFFF) {
            codePt -= 0x10000;
            return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 +
    (codePt & 0x3FF));
        }
        else {
            return String.fromCharCode(codePt);
        }
    }
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
        entityReferenceName = 'entity', // could change to "data" for standard approach
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
        if (    meta.hasAttribute(attPrefix+'content') && 
                meta.hasAttribute(attPrefix+'name') && 
                meta.getAttribute(attPrefix+'name') === 'entity'
            ) {
            pair = meta.getAttribute(attPrefix+'content').split('=', 2);
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
                lookup = entity.hasAttribute(attPrefix+'name') ? entity.getAttribute(attPrefix+'name') : entity.textContent;
                setText(lookup);
            }
            replaceNodeWithText(entity, text);
        };
    });
    
    // EXPORTS
    // Comment out to avoid globals
    this.e = function (lookup) {
        setText(lookup);
        document.write(text);
    };
}());
