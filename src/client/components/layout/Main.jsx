export default function Main({ children }) {
  return (
    <main className="flex-1 px-4 py-8 flex flex-col w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-3xl mx-auto">
      {children}
    </main>
  );
}