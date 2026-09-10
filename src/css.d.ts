/**
 * Stylesheets are imported for their side effect and carry no bindings.
 *
 * webpack's `style-loader` turns such an import into a `<style>` tag at build
 * time. TypeScript needs to be told the module exists, since
 * `noUncheckedSideEffectImports` refuses an import it cannot resolve.
 */
declare module '*.css';
