# Plugins

Each `.js` file here is auto-loaded by `loadFromDirectory`. Export a function
`(query, items) => items` (or `{ filter }`). The file name is the plugin name.
