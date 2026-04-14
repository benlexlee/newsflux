export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-8">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} NewsFlux. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-2">Aggregated financial & sports news</p>
      </div>
    </footer>
  );
}