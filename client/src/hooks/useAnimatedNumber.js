import { useEffect, useRef, useState } from "react";

//Anima un número contando desde el valor anterior hasta "target" (en vez
//de saltar de golpe), usando requestAnimationFrame. Pensado para precios:
//cada vez que cambia la cantidad en un stepper, el total "cuenta" hacia
//el nuevo valor en ~300ms.
export const useAnimatedNumber = (target, duration = 300) => {
  const [displayed, setDisplayed] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const value = Math.round(from + (target - from) * t);
      setDisplayed(value);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return displayed;
};
