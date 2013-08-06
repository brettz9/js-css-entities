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
    a. Advantages:
        i. Does not require script file
        ii. Behavior defined in a standard
        iii. Easy to write definitions and references
        iv. Allows for nested entities
    b. Disadvantages:
        i. Browser support varies with single-point-of-failure for 
            externally defined entities not found in the internal
            subset and no fallbacks despite the XML specification's
            recommendations.
        ii. Requires less-used XML syntax and application/xhtml+xml 
            or application/xml content-type
2. Via XML (namespaced) elements harvested for definitions by 
    XSL or XSL variables
    a. Advantages:
        i. Pretty good browser support
        ii. Not difficult to write definitions and references
        iii. Allows for nested entities?
    b. Disadvantages:
        i. Not the official way to define replacement text (but will work)
        ii. Requires less-used XML syntax and application/xhtml+xml 
            or application/xml content-type
        iii. Requires additional download of XSL template to 
            perform replacements
    b. Disadvantages:
3. Via use of the CSS content property
    a. Advantages: 
        i. Does not require script file
        ii. Allows external file usage
    b) Disadvantages:
        i. Browser support varies
        ii. Somewhat cumbersome to write
        iii. Does not allow numeric definitions as allowed by the JavaScript 
            code (though the latter are really redundant anyways since HTML 
            supports numeric character references)).
        iv. Does not allow arbitrary HTML substitution--only text
        v. Requires CSS to be enabled
        vi. Does not support nested definitions
4. Via JavaScript (with optional HTML definitions):
    a. Approaches:
        i. Via definition of properties on a "JSEntityMap" global JavaScript 
            object defined before the entities.js file is included
        ii. Via HTML meta elements with name set to "entity" and "content" 
            attribute set to "{entity name}={entity name}"; script also
            allows retrieval of meta elements defined in an iframe in the
            body of the document so that this approach will also allow 
            external file definitions
    b. Advantages:
        i. Should work well in all well-used browsers
        ii. Easy to write definitions and references
        iii. Allows external file usage
    c. Disadvantages:
        i. Requires JavaScript enabled by user (though at least fallbacks 
            can be used if desired)
        ii. Requires inclusion and execution of external JavaScript file,
            waiting for content-load (and iframe load, if iframe definitions 
            are used).
        iii. Library does not currently support nested definitions or 
            arbitrary HTML (though easy to add)

The following means exist for creating entity references using the above
approaches:
1. Via XML entities:
    a. Entity references
2. Via XML elements
    b. Can use elements with or without content and let XSL handle
        substitutions as desired; preferable to use namespace
3. Via use of the CSS content property
    a. Empty HTML elements
        i. Custom elements for simple and descriptive but non-standard 
            references (e.g.,  or <entity ent=>)--also requires special 
            JavaScript handling in older IE browsers
        ii. HTML4 tags (e.g., div or span)
        iii. HTML5-standard "data" tag with "data-ent" attribute
4. Via HTML (in conjunction with JavaScript library and definitions):
    a. Empty HTML elements (or elements with fallback content for
        page load)
        i. Custom elements for simple and descriptive but non-standard 
            references (e.g., <entity> or <entity ent=>)
        ii. HTML4 tags (e.g., div or span) with "data-ent" attribute
        iii. HTML5-standard "data" tag with "data-ent" attribute
    b. Script tags (<script>e('{entity name}')</script>)

