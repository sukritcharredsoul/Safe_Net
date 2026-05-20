import Navbar from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
