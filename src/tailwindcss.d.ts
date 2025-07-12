type NestedDictionary = Record<string, string | NestedDictionary>;
declare module "tailwindcss/lib/util/flattenColorPalette" {
    function flattenColorPalette(colors: NestedDictionary): Record<string, string>;

    export default flattenColorPalette;
}
