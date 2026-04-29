export default function Footer() {
  return (
    <footer className="bg-gray-800 py-6 mt-8 border-t border-gray-700">
      <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} NewsFlux. All rights reserved.
      </div>
    </footer>
  );
}