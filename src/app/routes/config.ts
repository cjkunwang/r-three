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
  {
    label: "场景加载",
    items: [
      {
        path: "/texture/cubemap",
        label: "立方体贴图",
        component: lazy(() => import("@/pages/examples/texture/cubemap")),
      },
      {
        path: "/texture/texture",
        label: "全景",
        component: lazy(() => import("@/pages/examples/texture/texture")),
      },
    ],
  },
  {
    label: "控制交互",
    items: [
      {
        path: "/control/presentation",
        label: "演示控制",
        component: lazy(() => import("@/pages/examples/control/Presentation")),
      },
    ],
  },
  {
    label: "场景拆分",
    items: [
      {
        path: "/split/splitView",
        label: "场景拆分",
        component: lazy(() => import("@/pages/examples/split/splitView")),
      },
      {
        path: "/split/splitScene",
        label: "同屏异构",
        component: lazy(() => import("@/pages/examples/split/splitScene")),
      },
      {
        path: "/split/splitMaterial",
        label: "材质对比",
        component: lazy(() => import("@/pages/examples/split/splitMaterial")),
      },
    ],
  },
  {
    label: "剪裁效果",
    items: [
      {
        path: "/clip/clippingPlanes",
        label: "基础剪裁",
        component: lazy(() => import("@/pages/examples/clip/ClippingPlanes")),
      },
    ],
  },
];

export const DEFAULT_ROUTE = "/basic/box";
