function sortItems(items, key, direction) {
  return [...items].sort((a, b) => {
    const aValue = a[key] || "";
    const bValue = b[key] || "";
    if (typeof aValue === "string" && typeof bValue === "string") {
      return direction === "ascending"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return direction === "ascending"
        ? aValue > bValue
          ? 1
          : -1
        : bValue > aValue
          ? 1
          : -1;
    }
  });
}

export default sortItems;