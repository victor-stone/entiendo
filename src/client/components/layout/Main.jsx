export default function Main({ children, wide }) {
  const width = wide ? 'lg:max-w-5xl' : 'lg:max-w-3xl'
  return (
    <main className={`flex-1 px-0 py-0 sm:px-4 sm:py-8 flex flex-col w-full max-w-full sm:max-w-lg md:max-w-xl ${width} mx-auto`}>
      {children}
    </main>
  );
}