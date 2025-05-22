export default function Panel({ children }) {
  return ( // 
    <section className="bg-white rounded-xl shadow w-full p-6 mb-6">
      {children}
    </section>
  );
}