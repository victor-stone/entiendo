import CSVtoClipboard from "../admin/CSVtoClipboard";

export const ListingTools = [
  {
    name: "copyToClipboard",
    render: ({ rows }) => <CSVtoClipboard filtered={rows} />,
  },
  // Add more tools here as needed
];
