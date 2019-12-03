export const clamp = (min, max) => value => Math.max(min, Math.min(value, max));
export const identity = x => x;
export const noop = () => {};
export const compose = (...fns) =>
  fns.reduce((f, g) => (...args) => f(g(...args)));
export const maybe = (f, g) => v =>
  v === null || v === undefined ? f() : g(v);
export const snd = g => ([x, y]) => [x, g(y)];
export const toPair = v => [v, v];

export const getOffset = maybe(
  () => ({ left: 0, top: 0 }),
  compose(
    ([el, { left, top }]) => ({
      left: left + el.offsetLeft,
      top: top + el.offsetTop
    }),
    snd(el => getOffset(el.offsetParent)),
    toPair
  )
);

export const getPositionOnElement = compose(
  ({ left, top }) => (x, y) => ({
    x: x - left,
    y: y - top
  }),
  getOffset
);

export const isChildOf = (child, parent) =>
  !!(child && parent) &&
  (child === parent || isChildOf(child.parentElement, parent));
