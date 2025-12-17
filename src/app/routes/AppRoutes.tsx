import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { DEFAULT_ROUTE, NAV_GROUPS } from "./config";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to={DEFAULT_ROUTE} replace />} />
        {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
          <Route
            key={item.path}
            path={item.path.replace(/^\//, "")}
            element={
              <Suspense>
                <item.component />
              </Suspense>
            }
          />
        ))}
        <Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} />
      </Route>
    </Routes>
  );
}
