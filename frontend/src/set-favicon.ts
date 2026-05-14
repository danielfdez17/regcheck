import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { IoShieldCheckmarkSharp } from "react-icons/io5";

const FAVICON_COLOR = "#3b82f6";

function buildFaviconHref(): string {
  const svg = renderToStaticMarkup(
    createElement(IoShieldCheckmarkSharp, {
      color: FAVICON_COLOR,
      size: 32,
    }),
  );

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function setAppFavicon(): void {
  const href = buildFaviconHref();
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

  if (link === null) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    document.head.appendChild(link);
  }

  link.href = href;
}
