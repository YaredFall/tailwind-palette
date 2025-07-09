# tailwind-palette

Small tailwind plugin that enables dynamic colors usage

## Installation

Install the package:

```bash
npm i -D @yaredfall/tailwind-palette
```

Add plugin to your tailwind config:

```js
import palette from "@yaredfall/tailwind-palette";

/** @type {import('tailwindcss').Config} */
module.exports = {
    ...
    plugins: [
        palette
    ],
};

```

## Features

This plugin adds `palette-*` class that accepts any color key of your tailwind theme and enables usage of color utilities with color values of declared palette.
For example

- `palette-violet-600` enables utilities like `text-palette`, `bg-palette`, etc. with single value
- `palette-violet` enables utilities like `text-palette-*`, `bg-palette-*`, etc. with values from `50` to `950`

> Note that it only supports built-in tailwind color utilities but not custom ones

## Usage

```jsx
function Foo() {
    return (
        <div className="palette-violet bg-palette-50">
            <div class="text-palette-600">Hello world</div>
        </div>
    );
}
```
