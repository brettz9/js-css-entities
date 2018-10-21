# js-css-entities

HTML-BASED CUSTOM ENTITY REFERENCES are unfortunately not supported in
text/html (and XML support is spotty), despite their convenience in
authoring, especially for non-technical authors or those who wish to
share and utilize documents stored on the local file system without
a server to execute substitutions.

All of the following client-side approaches are possible, though they may be
technically discouraged for universal access since some people might not
enable JavaScript or CSS (and XML support is currently inconsistent as
far as entities, particularly with regard to external entities).

The example files detail the usage, but to summarize, the following means of
defining entities are possible:

1. Via XML entities
    1. Advantages:
        1. Does not require script file
        1. Behavior defined in a standard
        1. Easy to write definitions and references
        1. Allows for nested entities
    1. Disadvantages:
        1. Browser support varies with single-point-of-failure for
            externally defined entities not found in the internal
            subset and no fallbacks despite the XML specification's
            recommendations.
        1. Requires less-used XML syntax and application/xhtml+xml
            or application/xml content-type
1. Via XML (namespaced) elements harvested for definitions by
    XSL or XSL variables
    1. Advantages:
        1. Pretty good browser support
        1. Not difficult to write definitions and references
        1. Allows for nested entities?
    1. Disadvantages:
        1. Not the official way to define replacement text (but will work)
        1. Requires less-used XML syntax and application/xhtml+xml
            or application/xml content-type
        1. Requires additional download of XSL template to
            perform replacements
    1. Disadvantages:
1. Via use of the CSS content property
    1. Advantages:
        1. Does not require script file
        1. Allows external file usage
    1. Disadvantages:
        1. Browser support varies
        1. Somewhat cumbersome to write
        1. Does not allow numeric definitions as allowed by the JavaScript
            code (though the latter are really redundant anyways since HTML
            supports numeric character references)).
        1. Does not allow arbitrary HTML substitution--only text
        1. Requires CSS to be enabled
        1. Does not support nested definitions
1. Via JavaScript (with optional HTML definitions):
    1. Approaches:
        1. Via definition of properties on a "JSEntityMap" global JavaScript
            object defined before the entities.js file is included
        1. Via HTML meta elements with name set to "entity" and "content"
            attribute set to "{entity name}={entity name}"; script also
            allows retrieval of meta elements defined in an iframe in the
            body of the document so that this approach will also allow
            external file definitions; note that this meta extension has
            been proposed at http://wiki.whatwg.org/wiki/MetaExtensions
            thereby making them "legal HTML5 meta names" per the wiki.
        1. (One could also simply define entities such as `var copy = '\u00a9';`
            and then execute that, but that has the disadvantage of adding globals.)
    1. Advantages:
        1. Should work well in all well-used browsers
        1. Easy to write definitions and references
        1. Allows external file usage
    1. Disadvantages:
        1. Requires JavaScript enabled by user (though at least fallbacks
            can be used if desired)
        1. Requires inclusion and execution of external JavaScript file,
            waiting for content-load (and iframe load, if iframe definitions
            are used).
        1. Library does not currently support nested definitions or
            arbitrary HTML (though easy to add)

The following means exist for creating entity references using the above
approaches:

1. Via XML entities:
    1. Entity references
1. Via XML elements
    1. Can use elements with or without content and let XSL handle
        substitutions as desired; preferable to use namespace
1. Via use of the CSS content property
    1. Empty HTML elements
        1. Custom elements for simple and descriptive but non-standard
            references (e.g.,  or <entity ent=>)--also requires special
            JavaScript handling in older IE browsers
        1. HTML4 tags (e.g., div or span)
        1. HTML5-standard "data" tag with "data-ent" attribute
1. Via HTML (in conjunction with JavaScript library and definitions):
    1. Empty HTML elements (or elements with fallback content for
        page load)
        1. Custom elements for simple and descriptive but non-standard
            references (e.g., <entity> or <entity ent=>)
        1. HTML4 tags (e.g., div or span) with "data-ent" attribute
        1. HTML5-standard "data" tag with "data-ent" attribute
    1. Script tags (<script>e('{entity name}')</script>)

# Supports

Tested in IE10 with document mode set to IE7-IE10. Tested in Firefox 23.0
