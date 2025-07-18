import plugin from "tailwindcss/plugin";
import Color from "color";
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

function paletteValueWithOpacity(key: string, modifier?: string | null) {
    return `rgb(var(${withNested(key)})_/_${modifier ?? 1})`;
}

function parseColor(color: string) {
    const [r, g, b] = Color(color).rgb().array();
    return { r, g, b };
}

const utilitiesToGenerate = [
    "text",
    "decoration",
    "bg",
    "border",
    "ring",
    "ring-offset",
    "outline",
    "caret",
    "shadow",
    "accent",
    "divide",
    "from",
    "via",
    "to",
];

const palette = plugin(({ matchUtilities, theme }) => {
    const colors = theme("colors") ?? {};

    const colorKeys = getThemeColorKeys(colors);
    const flatColors = flattenColorPalette(colors);

    const { palettes, nestedKeys } = getPluginValues(colorKeys, flatColors);

    matchUtilities(
        {
            palette: (val) => {
                if (typeof val === "string")
                    return {
                        [withNested("")]: val,
                    };

                return val.reduce(
                    (acc, e) => {
                        try {
                            const { r, g, b } = parseColor(e.color);
                            acc[withNested(e.key)] = acc[withNested(e.key)] = `${r} ${g} ${b}`;
                        } catch {
                            // ignore error
                        }
                        return acc;
                    },
                    {} as Record<string, string>,
                );
            },
        },
        {
            values: Object.fromEntries(palettes),
            type: ["color", "any"],
        },
    );

    const utilitiesValues = Object.fromEntries(nestedKeys);
    utilitiesToGenerate.forEach((utility) => {
        matchUtilities(
            {
                [`${utility}-palette`]: (val, { modifier }) => ({
                    [`@apply ${utility}-[${paletteValueWithOpacity(val, modifier)}]`]: "",
                }),
            },
            {
                values: utilitiesValues,
                modifiers: theme("opacity"),
            },
        );
    });
});

export default palette;
