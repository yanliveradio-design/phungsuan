import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
// Sửa đường dẫn: Thêm /src/ vào trước các folder components và pages
import { GlobalContextProviders } from "./src/components/_globalcontextproviders.tsx";
import Page_0 from "./src/pages/admin.tsx";
import PageLayout_0 from "./src/pages/admin.pageLayout.tsx";
import Page_1 from "./src/pages/books.tsx";
import PageLayout_1 from "./src/pages/books.pageLayout.tsx";
import Page_2 from "./src/pages/login.tsx";
import PageLayout_2 from "./src/pages/login.pageLayout.tsx";
import Page_3 from "./src/pages/_index.tsx";
import PageLayout_3 from "./src/pages/_index.pageLayout.tsx";
import Page_4 from "./src/pages/profile.tsx";
import PageLayout_4 from "./src/pages/profile.pageLayout.tsx";
import Page_5 from "./src/pages/activities.tsx";
import PageLayout_5 from "./src/pages/activities.pageLayout.tsx";
import Page_6 from "./src/pages/my-journey.tsx";
import PageLayout_6 from "./src/pages/my-journey.pageLayout.tsx";
import Page_7 from "./src/pages/books.$bookId.tsx";
import PageLayout_7 from "./src/pages/books.$bookId.pageLayout.tsx";
import Page_8 from "./src/pages/admin.activities.$activityId.tsx";
import PageLayout_8 from "./src/pages/admin.activities.$activityId.pageLayout.tsx";

if (!window.requestIdleCallback) {
  window.requestIdleCallback = (cb) => {
    setTimeout(cb, 1);
  };
}

import "./base.css";

// Cập nhật key trong Map để khớp với đường dẫn mới
const fileNameToRoute = new Map([
  ["./src/pages/admin.tsx", "/admin"],
  ["./src/pages/books.tsx", "/books"],
  ["./src/pages/login.tsx", "/login"],
  ["./src/pages/_index.tsx", "/"],
  ["./src/pages/profile.tsx", "/profile"],
  ["./src/pages/activities.tsx", "/activities"],
  ["./src/pages/my-journey.tsx", "/my-journey"],
  ["./src/pages/books.$bookId.tsx", "/books/:bookId"],
  ["./src/pages/admin.activities.$activityId.tsx", "/admin/activities/:activityId"]
]);

const fileNameToComponent = new Map([
  ["./src/pages/admin.tsx", Page_0],
  ["./src/pages/books.tsx", Page_1],
  ["./src/pages/login.tsx", Page_2],
  ["./src/pages/_index.tsx", Page_3],
  ["./src/pages/profile.tsx", Page_4],
  ["./src/pages/activities.tsx", Page_5],
  ["./src/pages/my-journey.tsx", Page_6],
  ["./src/pages/books.$bookId.tsx", Page_7],
  ["./src/pages/admin.activities.$activityId.tsx", Page_8],
]);

function makePageRoute(filename: string) {
  const Component = fileNameToComponent.get(filename);
  return Component ? <Component /> : null;
}

function toElement({
  trie,
  fileNameToRoute,
  makePageRoute,
}: {
  trie: LayoutTrie;
  fileNameToRoute: Map<string, string>;
  makePageRoute: (filename: string) => React.ReactNode;
}) {
  return [
    ...trie.topLevel.map((filename) => (
      <Route
        key={fileNameToRoute.get(filename)}
        path={fileNameToRoute.get(filename)}
        element={makePageRoute(filename)}
      />
    )),
    ...Array.from(trie.trie.entries()).map(([Component, child], index) => (
      <Route
        key={index}
        element={
          <Component>
            <Outlet />
          </Component>
        }
      >
        {toElement({ trie: child, fileNameToRoute, makePageRoute })}
      </Route>
    )),
  ];
}

type LayoutTrieNode = Map<
  React.ComponentType<{ children: React.ReactNode }>,
  LayoutTrie
>;
type LayoutTrie = { topLevel: string[]; trie: LayoutTrieNode };
function buildLayoutTrie(layouts: {
  [fileName: string]: React.ComponentType<{ children: React.ReactNode }>[];
}): LayoutTrie {
  const result: LayoutTrie = { topLevel: [], trie: new Map() };
  Object.entries(layouts).forEach(([fileName, components]) => {
    let cur: LayoutTrie = result;
    for (const component of components) {
      if (!cur.trie.has(component)) {
        cur.trie.set(component, {
          topLevel: [],
          trie: new Map(),
        });
      }
      cur = cur.trie.get(component)!;
    }
    cur.topLevel.push(fileName);
  });
  return result;
}

function NotFound() {
  return (
    <div>
      <h1>Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>Go back to the <a href="/" style={{ color: 'blue' }}>home page</a>.</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <GlobalContextProviders>
        <Routes>
          {toElement({
            trie: buildLayoutTrie({
              "./src/pages/admin.tsx": PageLayout_0,
              "./src/pages/books.tsx": PageLayout_1,
              "./src/pages/login.tsx": PageLayout_2,
              "./src/pages/_index.tsx": PageLayout_3,
              "./src/pages/profile.tsx": PageLayout_4,
              "./src/pages/activities.tsx": PageLayout_5,
              "./src/pages/my-journey.tsx": PageLayout_6,
              "./src/pages/books.$bookId.tsx": PageLayout_7,
              "./src/pages/admin.activities.$activityId.tsx": PageLayout_8,
            }), fileNameToRoute, makePageRoute
          })}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GlobalContextProviders>
    </BrowserRouter>
  );
}
