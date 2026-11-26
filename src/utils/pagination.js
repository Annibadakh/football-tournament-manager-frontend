export const ELLIPSIS = "ellipsis";

// Always shows first, last and the pages around the current one: 1 … 4 5 6 … 20
export const getPageNumbers = (currentPage, totalPages, siblings = 1) => {
  const pages = [];
  for (let page = 1; page <= totalPages; page += 1) {
    const isEdge = page === 1 || page === totalPages;
    const isNear = Math.abs(page - currentPage) <= siblings;
    if (isEdge || isNear) pages.push(page);
    else if (pages[pages.length - 1] !== ELLIPSIS) pages.push(ELLIPSIS);
  }
  return pages;
};
