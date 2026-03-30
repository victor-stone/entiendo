# Listing Components Guide

This folder contains a reusable table/listing system.

If you are new to code, think of it as:
- `Listing.jsx` = the engine
- `ListingColumns.jsx` = what columns exist
- `ListingFilters.jsx` = what filters exist
- `ListingTools.jsx` = optional action buttons/tools
- `ListingHeader.jsx` and `ListingBody.jsx` = table UI pieces

## 1. Quick Start (basic listing)

```jsx
import Listing from "../../components/listing/Listing";

function MyPage({ idioms }) {
  return <Listing data={idioms} />;
}
```

With only `data`, `Listing` uses defaults:
- Filters: `["text", "tone", "usage"]`
- Columns: `["text", "translation", "tone", "usage"]`
- Tools: `[]`

## 2. Main Props You Can Pass

`Listing` accepts:
- `data`: array of rows to show (required)
- `filters`: array of filter names from `ListingFilters`
- `columns`: array of column names from `ListingColumns`
- `tools`: array of tool names from `ListingTools`
- `context`: shared object for filters/columns/tools (optional)
- `onSelectRow(row, rowIndex)`: called when user clicks a row
- `onUpdateRow(row, ctx)`: called by custom column actions

Example:

```jsx
<Listing
  data={data}
  filters={["text", "source"]}
  columns={["text", "transcription", "source", "assign", "publish"]}
  tools={["copyToClipboard", "newIdiomPopup"]}
  context={{ editors }}
  onSelectRow={(row) => setSelected(row)}
  onUpdateRow={(row, ctx) => {
    console.log("row update", row, ctx);
  }}
/>
```

## 3. How Column Customization Works

`columns` is a list of names. Each name must exist in `ListingColumns.jsx`.

Current built-in names:
- `sync`
- `text`
- `translation`
- `tone`
- `usage`
- `transcription`
- `assign`
- `publish`
- `source`

### Add a new column

In `ListingColumns.jsx`, add an object to `ListingColumns`:

```jsx
{
  name: "difficulty",
  label: "Difficulty",
  key: "difficulty",
  sortable: true,
  defaultSort: false,
  render: (row, ctx) => row.difficulty ?? "unknown"
}
```

Field meanings:
- `name`: ID used in `columns={[...]}`
- `label`: header text
- `key`: row field used for sort/fallback display
- `sortable`: if true, header can be clicked to sort
- `defaultSort`: first active column with this becomes initial sort
- `render(row, ctx)`: optional custom cell renderer
- `className`: optional `<td>` styles
- `sorter(items, direction)`: optional custom sort function

Important:
- If `sortable: true`, include a `key`.
- Custom `sorter` should return a sorted array of `items`.

## 4. How Filter Customization Works

`filters` is also a list of names, resolved from `ListingFilters.jsx`.

Current built-in names:
- `text`
- `tone`
- `usage`
- `source`

Each filter object has:
- `name`
- `defaultValue`
- `render(value, setValue, context)` for the filter UI
- `filter(row, value)` that returns `true` to keep the row

### Add a new filter

```jsx
{
  name: "onlyPublished",
  defaultValue: false,
  render: (value, setValue) => (
    <label>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => setValue(e.target.checked)}
      />
      Only published
    </label>
  ),
  filter: (row, value) => !value || !!row.homework?.publishedAt
}
```

## 5. How Tool Customization Works

`tools` are optional widgets shown next to filters.
They are looked up by name in `ListingTools.jsx`.

Current built-in names:
- `copyToClipboard`
- `newIdiomPopup`

Tool object shape:

```jsx
{
  name: "myTool",
  render: ({ rows, context }) => <MyTool rows={rows} context={context} />
}
```

`rows` is already filtered/sorted, so tools can act on what the user currently sees.

## 6. Row Click and Row Updates

Use `onSelectRow` to make rows clickable:

```jsx
<Listing data={data} onSelectRow={(row) => setSelectedRow(row)} />
```

Use `onUpdateRow` when a custom column button/edit control needs to notify parent code:

```jsx
<Listing
  data={data}
  onUpdateRow={(row, ctx) => {
    if (ctx.action === "assignSource") {
      // do API call here
    }
  }}
/>
```

## 7. Practical Notes

- Unknown names in `filters`, `columns`, or `tools` are ignored.
- Empty results show: `No items found matching the current filters`.
- Row key priority in table body is `exampleId`, then `idiomId`, then array index.
- `context` is passed to filters/columns/tools and Listing also adds:
  - `context.getValueForFilter(filterName)` to read current filter values.
