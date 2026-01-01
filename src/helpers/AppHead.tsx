import React from "react";
import { Helmet } from "react-helmet";
import { useBranding } from "./useBranding";

export const AppHead = () => {
  const { branding } = useBranding();

  const title = branding?.appName || "Phụng Sự An";
  const favicon = branding?.logoValue;

  return (
    <Helmet>
      <title>{title}</title>
      {favicon && <link rel="icon" type="image/x-icon" href={favicon} />}
    </Helmet>
  );
};