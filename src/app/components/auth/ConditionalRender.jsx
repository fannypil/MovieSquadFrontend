"use client";

import { usePermissions } from "@/app/hooks/usePermissions";
import React from "react";

const ConditionalRender = ({
  permission,
  context = {},
  children,
  fallback = null,
}) => {
  const { checkPermission } = usePermissions();

  return checkPermission(permission, context) ? children : fallback;
};

export default ConditionalRender;
