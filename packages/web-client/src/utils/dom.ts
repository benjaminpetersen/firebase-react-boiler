export const allParents = (el: Element): Element[] => {
  if (el.parentElement)
    return [el.parentElement, ...allParents(el.parentElement)];
  else return [el];
};

export const scrollIntoViewIfNeeded = (el: Element) => {
  const elBcr = el.getBoundingClientRect();
  const bcrChain = allParents(el).map((n) => ({
    bcr: n.getBoundingClientRect(),
    el: n,
  }));
  if (
    bcrChain.some(
      (p) =>
        elBcr.top + elBcr.height < p.bcr.top ||
        elBcr.bottom - elBcr.height > p.bcr.bottom ||
        elBcr.left + elBcr.width < p.bcr.left ||
        elBcr.right - elBcr.width > p.bcr.right,
    )
  ) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }
};
