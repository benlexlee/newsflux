export default function SportsTicker() {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-1 px-4 rounded-lg mb-4 overflow-hidden shadow-md">
      <iframe
        src="https://sportscore.com/embed/fixtures/football/world-cup/"
        width="100%"
        height="50"
        style={{ border: 'none', overflow: 'hidden' }}
        title="World Cup Scores"
      />
    </div>
  );
}