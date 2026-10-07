import React from "react";
import { Composition } from "remotion";
import { Teaser } from "./Teaser";
import tl from "./timeline.json";

export const Root: React.FC = () => (
  <Composition id="Teaser" component={Teaser} durationInFrames={tl.total} fps={tl.fps} width={tl.width} height={tl.height} />
);
