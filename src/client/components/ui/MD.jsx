import Markdown from 'react-markdown';

const MD = ({ children }) => (
  <Markdown
    components={{
      a: ({ node, ...props }) => (
        <a {...props} className="text-blue-600 dark:text-blue-100 underline" />
      ),
    }}
  >
    {children}
  </Markdown>
);

export default MD;