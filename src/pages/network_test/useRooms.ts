import { useEffect, useState } from "react";
import { Connection } from "./Connection";

export const useRooms = (conn: Connection | undefined | null) => {
  const [rooms, set_rooms] = useState(conn?.rooms ?? []);
  useEffect(() => {
    if (!conn) return;
    const fn = conn.callbacks.add({ on_rooms_change: r => set_rooms(r) });
    return () => fn();
  }, [conn]);
  return { rooms };
};
