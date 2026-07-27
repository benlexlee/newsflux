export default function SportsTicker() {
  return (
    <div className="bg-gradient-to-r from-red-700 to-red-900 py-1 rounded-lg mb-4 overflow-hidden shadow-md">
      <iframe
        src="https://sportscore.com/embed/fixtures/football/live/"
        width="100%"
        height="40"
        style={{ border: 'none', overflow: 'hidden' }}
        title="Live Scores"
      />
    </div>
  );
}