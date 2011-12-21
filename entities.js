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
    
    // EVENT ATTACHMENT
    this.addEventListener('load', function () {
        var lookup, entity, text,
            d = document, 
            map = JSEntityMap ? JSEntityMap : {},
            // Might want these next two configurable:
            metaHeadOnly = false, // True would be a little faster, 
                                    // but wouldn't allow users to define their own 
                                    // (e.g., within a comment or wiki system)
            entityReferenceName = 'entity',
            entities = d.getElementsByTagName(entityReferenceName),
            metas = (metaHeadOnly ? d.head : d).getElementsByTagName('meta');
        
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
        
        while (entities.length) {
            entity = entities[0];
            // One might add other conditions here to transform to different kinds of elements, etc. or
            //   allow a callback or two to check and define text or replacement node
            // The first two conditions are not very helpful since possible as HTML entities
            if (entity.hasAttribute('dec')) {
                text = fixedFromCharCode(parseInt(entity.getAttribute('dec'), 10));
            }
            else if (entity.hasAttribute('hex')) {
                text = fixedFromCharCode(parseInt(entity.getAttribute('hex'), 16));
            }
            else {
                lookup = entity.hasAttribute('name') ? entity.getAttribute('name') : entity.textContent;
                
                if (!map[lookup]) {
                    alert(
                        'You must define an entity "' + lookup +
                        '" within <meta> tags and/or define and add to a "JSEntityMap" JavaScript object variable.'
                    );
                    break;
                }
                text = map[lookup];
            }
            replaceNodeWithText(entity, text);
        };
    });
}());
