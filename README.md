# README

## Development Process

Before your code is committed, several linting and formatting steps should take place. please run the following for each file or directory being modified:

- For JavaScript only, run `npx eslint --fix [path to file]`.
- For CSS only, run `npx stylelint --fix [path to file]`.
- For either, run one of the above linters then run `npx prettier --write [path to file]`.
- See scripts in `package.json` to run linting and formatting globally

There is also an option to add this functionality via a pre-commit hook.  
Run `npm run hook:install:pre-commit` to install a linting and formatting hook,
and run `npm run hook:delete:pre-commit` to remove it.
See the [hook script](./.github/hooks/pre-commit-fix) for more information.

## Application Configuration

Some application configuration is done via the [`get app config` macro](./themes/Integrative%20Nutrition/macros/get-app-config.html).
You can create and modify a local, git ignored version `get-app-config.local.html` for use in your development environment,
and upload it to your default hubspot cli environment with `npm run hs:upload:local-config`.

### Development in Production

Please use 

```html
<meta name="robots" content="noindex">
```

in the head of any pages you are actively developing in production, so they will not be indexed by search if they are found.

### Hubspot Rich Text Fields (RTF)

Please limit the available options content creators have when adding a custom module by adding the follow key/value pair in the `fields.json`. For more information, see the [Hubspot documentation](https://developers.hubspot.com/docs/cms/building-blocks/module-theme-fields/rich-text-editor).

```json
{
    "type": "richtext",
    ...
    "enabled_features": [
      "advanced_emphasis",
      "anchor",
      "indents",
      "link",
      "lists",
      "standard_emphasis"
    ]
}
```

Other options include:

```json
[
    "image",
    "emoji",
    "personalize",
    "cta",
    "embed",
    "video",
    "table",
    "charmap",
    "hr",
    "nonbreaking_space",
    "icon",
    "source_code",
    "visual_blocks",
]
```

#### Warning

Some rich text fields may contain hubl, e.g. `{{ macro() }}`, which can throw an error in certain cases (like being parsed by the `hs` cli for some reason). One can use a regex replacement to strip out the problematic portions, e.g. `some_rich_text|regex_replace("{{.+?}}", "")`.

### Reference Implementation

See the [CMS-theme-boilerplate](https://github.com/HubSpot/cms-theme-boilerplate) for a reference example of a Hubspot theme.

## CSS Code Style

### Custom Properties (Variables) 

[CSS Tricks Complete Guide to Custom Properties](https://css-tricks.com/a-complete-guide-to-custom-properties/)

Use variables whenever possible, especially for:

- `color`
- `font-family`
- `font-size`
- `font-weight`
- `letter-spacing`
- `line-height`

If one doesn't exist please create one.

Variables used by multiple components should be defined in the variables directory.

Variables that are specific to a file can be added in that file.

To scope the variable, it can be added inside the parent selector.

```css
.example-class {
  --margin-right: 20px;
}

.example-class  a {
  margin-right: var(--margin-right);
}

.example-class  b {
  margin-right: var(--margin-right);
}
```

If the variable needs to apply to multiple top-level siblings in a file, it should be declared at the beginning of the file.

Since this variable will still be accessible globally, it should be prefixed with a name that will be unique to this file.

```css
.example-class {
  --example-class--margin-right: 20px;
}

.example-class__a {
  margin-right: var(--example-class--margin-right);
}

.example-class__b {
  margin-right: var(--example-class--margin-right);
}
```

### Sequence

Write code in this sequence, when possible.

1. Custom properties (variables)
2. Native "mixins"
3. Properties
4. Media queries

### Specificity 

- [MDN on Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)
- [CSS Tricks on Specificity](https://css-tricks.com/specifics-on-css-specificity/)

Create groups that share selector specificity. This will avoid the need to worry about code later in the file being overwritten by code earlier in it.

2. Pseudo-element (0-0-1)
1. Element (0-0-1)
3. Pseudo-class (0-1-0)
4. Attribute (0-1-0)
5. Class (0-1-0)
6. Element + Class (0-1-1)
7. ID (1-0-0)

#### Example:

```css
::pseudo-element {
  color: red;
}

element {
  color: orange;
}

:pseudo-class {
  color: yellow;
}

[attribute] {
  color: green;
}

.class {
  color: blue;
}

element.class {
  color: indigo;
}

#id {
  color: violet;
}
```

### Alphabetization 

Within each group, sequence selectors alphabetically. This sequence doesn't require tight coupling to markup that happens to exist on a page at one moment in time. It will be helpful to create class names that conform with this approach. Prefix class names with the name of a block, in this case "modal" that contains the child elements ("modal-body" and "modal-title").

#### Example:

```css
.close {
  color: red;
}

.modal {
  color: orange;
}

.modal-body {
  color: yellow;
}

.modal-title {
  color: green;
}

.non-modal {
  color: blue;
}
```

### Pseudo-Classes

Sequence pseudo-classes by use order.

Typically, a user will first hover over an element, then bring it to focus, then activate it. Since the last defined pseudo-class will take precedence, the recommended sequence is:

1. `hover`
2. `focus`
3. `active`

### Pseudo-Elements

Remember to use `::` instead of `:` (deprecated) to declare a pseudo-element.

```css
.modal::before {
    ...
}
```

### Media Queries

Sequence media queries by width.

- `min-width` media queries should be sequenced narrow to wide.
- `max-width` media queries should be sequenced wide to narrow.

### Property Order

It is useful to create a standard sequence of properties. Using alphabetic sequence has the benefit that it does not require developers to learn a pattern but concentric is preferred here because it allows for natural groupings of properties, the way many developers have organized their code historically.

[Stylelint Config Concentric Order](https://github.com/chaucerbao/stylelint-config-concentric-order/blob/master/src/index.js)

### Think Modularly

It can be time-consuming to investigate rules that exist in multiple different places within a document or in several different documents. In order to simplify this process, we can separate our rules into cohesive units.

- [A Quick Guide To Modular CSS](https://raygun.com/blog/modular-css/)
- [What is Modular CSS?](https://spaceninja.com/2018/09/18/what-is-modular-css/)

### Values

Avoid grouping selectors by property value.

```css
a,
b {
  color: red; 
}

a {
  text-decoration: underline;
}

b {
  font-weight: bold;
}
```

While it may be the case that `a` and `b` share the same `color`, unless they share all properties, it can become complicated to track multiple instances of the same selector spread throughout the codebase.

This might be better expressed as: 

```css
:root {
  --text--color: red;
}

a {
  text-decoration: underline;
  color: var(--text--color);
}

b {
  color: var(--text--color);
  font-weight: bold;  
} 
```

### Avoid Assigning Styles to Elements

Since nothing is more local than a tag, if a color is assigned to "p" this style will always override any color value that may have been assigned to its parent and will require the color for "p" to be explicitly overridden in every location. It is preferable to apply styles within the scope of their usage, rather than relying on deeply nested overrides. Adding styles primarily to classes instead of tags can help avoid this.

