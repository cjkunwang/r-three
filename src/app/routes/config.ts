import { lazy } from "react";

export type NavItem = {
  path: string;
  label: string;
  component: React.LazyExoticComponent<() => JSX.Element>;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "基础几何",
    items: [
      {
        path: "/basic/box",
        label: "旋转立方体",
        component: lazy(() => import("@/pages/examples/basic/box")),
      },
      {
        path: "/basic/sphere",
        label: "旋转球体",
        component: lazy(() => import("@/pages/examples/basic/sphere")),
      },
    ],
  },
  {
    label: "材质效果",
    items: [
      {
        path: "/materials/torus",
        label: "金属环结",
        component: lazy(() => import("@/pages/examples/materials/torus")),
      },
    ],
  },
];

export const DEFAULT_ROUTE = "/basic/box";
