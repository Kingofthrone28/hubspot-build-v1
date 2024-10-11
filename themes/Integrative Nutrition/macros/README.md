# Hubl Macros

For more info on macro imports, see the [Hubspot documentation page](https://developers.hubspot.com/beta-docs/reference/cms/hubl/variables-macros-syntax).

From a module, you can use a relative path `{% from '../../macros/{macro-file}.html' import {macro-name} %}`.

## Regex

For the `regex_replace` filter, see the [google wiki](https://github.com/google/re2/wiki/Syntax) for RE2 syntax.
There is a playground you can use for basic testing [here](https://re2js.leopard.in.ua/).

## 'Return' values of a macro

`{% set dict_key = get_dict_key(category.label)|trim %}`

When using a macro to generate a string to save in a variable, `|trim` must be called _after_ the macro in order to properly remove whitespace (added during inlining?).