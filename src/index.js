import { useCallback, useState, useRef } from "react";

const clamp = (min, max) => value => Math.max(min, Math.min(value, max));
const identity = x => x;
const noop = () => {};
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
const maybe = (f, g) => v => (v === null || v === undefined ? f() : g(v));
const snd = g => ([x, y]) => [x, g(y)];
const toPair = v => [v, v];

const getOffset = maybe(
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

const getPositionOnElement = compose(
  ({ left, top }) => (x, y) => ({
    x: x - left,
    y: y - top
  }),
  getOffset
);

const isChildOf = (child, parent) =>
  !!(child && parent) &&
  (child === parent || isChildOf(child.parentElement, parent));

const usePanZoom = ({
  container,
  enablePan = true,
  enableZoom = true,
  requirePinch = false,
  preventClickOnPan = true,
  zoomSensitivity = 0.01,
  minZoom = 0,
  maxZoom = Infinity,
  minX = -Infinity,
  maxX = Infinity,
  minY = -Infinity,
  maxY = Infinity,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
  onPanStart = noop,
  onPan = noop,
  onPanEnd = noop,
  onZoom = noop
}) => {
  if (container === undefined) {
    throw Error("Container cannot be empty and should be a ref");
  }
  const wasPanning = useRef(false);
  const prev = useRef({ prevX: 0, prevY: 0 });

  const [isPanning, setPanning] = useState(false);
  const [transform, setTransform] = useState({
    ...initialPan,
    zoom: initialZoom
  });

  const clampX = useCallback(clamp(minX, maxX), [minX, maxX]);
  const clampY = useCallback(clamp(minY, maxY), [minY, maxY]);
  const clampZoom = useCallback(clamp(minZoom, maxZoom), [minZoom, maxZoom]);

  const setPan = useCallback(
    f =>
      setTransform(({ x, y, zoom }) => {
        const newPan = typeof f === "function" ? f({ x, y }) : f;

        return {
          x: clampX(newPan.x),
          y: clampY(newPan.y),
          zoom
        };
      }),
    [minX, maxX, minY, maxY]
  );

  const setZoom = useCallback(
    (f, maybeCenter) =>
      setTransform(({ x, y, zoom }) => {
        const newZoom = clampZoom(typeof f === "function" ? f(zoom) : f);

        const center = maybe(
          () => ({
            x: container.current.offsetWidth / 2,
            y: container.current.offsetHeight / 2
          }),
          identity
        )(maybeCenter);

        return {
          x: clampX(x + ((center.x - x) * (zoom - newZoom)) / zoom),
          y: clampY(y + ((center.y - y) * (zoom - newZoom)) / zoom),
          zoom: newZoom
        };
      }),
    [minX, maxX, minY, maxY, minZoom, maxZoom]
  );

  const onMouseDown = useCallback(
    event => {
      if (enablePan) {
        prev.current = { prevX: event.pageX, prevY: event.pageY };

        setPanning(true);

        onPanStart(event);
      }
    },
    [enablePan, onPanStart]
  );

  const onMouseMove = useCallback(
    event => {
      if (isPanning) {
        wasPanning.current = true;

        const { pageX, pageY } = event;
        const { prevX, prevY } = prev.current;
        prev.current = { prevX: pageX, prevY: pageY };

        setPan(({ x, y }) => ({
          x: x + pageX - prevX,
          y: y + pageY - prevY
        }));

        onPan(event);
      }
    },
    [isPanning, onPan, minX, maxX, minY, maxY]
  );

  const onMouseUp = useCallback(
    event => {
      if (isPanning) {
        setPanning(false);
        onPanEnd(event);
      }
    },
    [isPanning, onPanEnd]
  );

  const onClickCapture = useCallback(
    event => {
      if ((preventClickOnPan, wasPanning.current)) {
        wasPanning.current = false;
        event.stopPropagation();
      }
    },
    [preventClickOnPan]
  );

  const onMouseOut = useCallback(
    event => {
      if (isPanning && !isChildOf(event.relatedTarget, container.current)) {
        onPanEnd(event);
        setPanning(false);
      }
    },
    [isPanning, onPanEnd]
  );

  const onWheel = useCallback(
    event => {
      event.preventDefault();
      if (enableZoom && container.current && (!requirePinch || event.ctrlKey)) {
        const { pageX, pageY, deltaY } = event;
        const pointerPosition = getPositionOnElement(container.current)(
          pageX,
          pageY
        );

        setZoom(
          zoom => zoom * Math.pow(1 - zoomSensitivity, deltaY),
          pointerPosition
        );

        onZoom(event);
      }
    },
    [enableZoom, requirePinch, onZoom, minX, maxX, minY, maxY, minZoom, maxZoom]
  );

  return {
    transform: `translate3D(${transform.x}px, ${transform.y}px, 0) scale(${
      transform.zoom
    })`,
    pan: { x: transform.x, y: transform.y },
    zoom: transform.zoom,
    setPan,
    setZoom,
    panZoomHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onClickCapture,
      onMouseOut,
      onWheel
    }
  };
};

export default usePanZoom;
