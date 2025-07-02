declare module "tailwindcss/lib/util/color" {
    type ColorMode = "rgb" | "rgba" | "hsl" | "hsla";
    type ParsedColor = { mode: ColorMode; color: [string, string, string]; alpha: string | undefined };
    function parseColor(value: string, { loose }?: { loose: boolean }): null | ParsedColor;
    function formatColor({ mode, color, alpha }: ParsedColor): string;

    export { parseColor, formatColor };
}

type NestedDictionary = Record<string, string | NestedDictionary>;
declare module "tailwindcss/lib/util/flattenColorPalette" {
    function flattenColorPalette(colors: NestedDictionary): Record<string, string>;

    export default { default: flattenColorPalette };
}
