// Task B offline verification helper: stub the Next.js-only 'server-only'
// guard package so plain Node can import lib/server/*.ts without changes.
export function resolve(specifier, context, next) {
  if (specifier === 'server-only') {
    return { shortCircuit: true, url: 'data:text/javascript,export default {};' };
  }
  return next(specifier, context);
}
