import React from "react";
import { IZip } from "../LF2/ditto/zip/IZip";

export const shared_ctx = React.createContext<{ zip?: IZip }>({});