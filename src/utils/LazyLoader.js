import React, { lazy } from "react";

export const lazyImport = (factory, name) => {
  return lazy(() =>
    factory().then((module) => ({ default: module[name] }))
  );
};
