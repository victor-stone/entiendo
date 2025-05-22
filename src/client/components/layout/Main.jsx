export default function Main({ children }) {
  return (
    <main className="flex-1 w-full max-w-xl px-4 py-8 flex flex-col mx-auto">
      {children}
    </main>
  );
}