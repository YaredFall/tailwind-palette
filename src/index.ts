import { parseColor } from "tailwindcss/lib/util/color";
import plugin from "tailwindcss/plugin";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

interface RecursiveKeyValuePair<K extends string = string, V = string> {
    [key: string]: V | RecursiveKeyValuePair<K, V>;
}
function getThemeColorKeys(colors: RecursiveKeyValuePair) {
    const keys = new Set<string>();

    const getKeys = (value: string | RecursiveKeyValuePair, path = "") => {
        if (typeof value === "string") {
            keys.add(path.replace(/-default/i, ""));
        } else {
            for (const key in value) {
                if (path) keys.add(path.replace(/-default/i, ""));
                if (value[key]) getKeys(value[key], path ? (key ? `${path}-${key}` : path) : key);
            }
        }
    };

    getKeys(colors);

    return Array.from(keys);
}

function getPluginValues(colorKeys: string[], flatColors: Record<string, string>) {
    const palettes = new Map<string, Array<{ key: string; color: string }>>();
    const nestedKeys = new Map<string, string>();

    colorKeys.forEach((key) => {
        const toAdd = Object.keys(flatColors)
            .filter((valueKey) => valueKey.startsWith(key))
            .map((valueKey) => {
                const nestedKey = valueKey.slice(key.length + 1);

                nestedKeys.set(nestedKey || "DEFAULT", nestedKey);
                return {
                    key: nestedKey,
                    color: flatColors[valueKey]!,
                };
            });
        palettes.set(key, (palettes.get(key) ?? []).concat(toAdd));
    });

    return { palettes, nestedKeys };
}

const PALETTE_VARIABLE = "--color-palette";

function withNested(key: string) {
    const keyValue = key ? `-${key}` : "";
    return `${PALETTE_VARIABLE}${keyValue}`;
}

function paletteValueWithOpacity(key: string, modifier?: string) {
    return `rgb(var(${withNested(key)}) / ${modifier ?? 1})`;
}

const palette = plugin(async ({ matchUtilities, theme }) => {
    const colors = theme("colors") ?? {};

    const colorKeys = getThemeColorKeys(colors);
    const flatColors = flattenColorPalette.default(colors);

    const { palettes, nestedKeys } = getPluginValues(colorKeys, flatColors);

    matchUtilities(
        {
            "text-palette": (val, { modifier }) => {
                return {
                    color: paletteValueWithOpacity(val, modifier),
                };
            },
            "bg-palette": (val, { modifier }) => {
                return {
                    backgroundColor: paletteValueWithOpacity(val, modifier),
                };
            },
            "border-palette": (val, { modifier }) => {
                return {
                    borderColor: paletteValueWithOpacity(val, modifier),
                };
            },
            "outline-palette": (val, { modifier }) => {
                return {
                    outlineColor: paletteValueWithOpacity(val, modifier),
                };
            },
        },
        {
            values: Object.fromEntries(nestedKeys),
            modifiers: theme("opacity"),
        },
    );

    matchUtilities(
        {
            palette: (val) => {
                if (typeof val === "string")
                    return {
                        [withNested("")]: val,
                    };

                return Object.fromEntries(val.map((e) => [withNested(e.key), parseColor(e.color)!.color.join(" ")]));
            },
        },
        {
            values: Object.fromEntries(palettes),
            type: ["color", "any"],
        },
    );
});

export default palette;
