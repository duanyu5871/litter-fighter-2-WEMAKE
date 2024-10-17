import { useEffect, useRef } from "react";
import { BounceTales } from "./BounceTales";

export default function MNE() {
  const ref_canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const solution = new BounceTales(ref_canvas.current!).run()
    return () => solution.release()
  }, [])
  return <canvas ref={ref_canvas} />
}