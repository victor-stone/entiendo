import Navbar from "../ui/Navbar";

// className="min-h-screen bg-primary-50 dark:bg-primary-950 flex flex-col">
export default function Page({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
      {children}
    </div>
  );
}