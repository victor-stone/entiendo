import React from "react";

const ListingBody = ({ columns, filteredItems, onUpdateRow, context, onSelectRow }) => (
  <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-700">
    {filteredItems.length > 0 ? (
      filteredItems.map((row, rowIndex) => (
        <tr
          key={row.exampleId || row.idiomId || rowIndex}
          onClick={onSelectRow ? () => onSelectRow(row, rowIndex) : undefined}
          style={onSelectRow ? { cursor: "pointer" } : undefined}
        >
          {columns.map((col, colIndex) => (
            <td key={col.name || colIndex} className={col.className}>
              {col.render
                ? col.render(row, { ...context, onUpdateRow, rowIndex, colIndex })
                : row[col.key]}
            </td>
          ))}
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={columns.length} style={{ textAlign: "center", color: "var(--color-primary-500)", background: "none" }}>
          No items found matching the current filters
        </td>
      </tr>
    )}
  </tbody>
);

export default ListingBody;
