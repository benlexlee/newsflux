export default function SportsTicker() {
  return (
    <div className="bg-blue-900 text-white py-2 overflow-hidden whitespace-nowrap rounded-lg mb-4">
      <div className="inline-block animate-[ticker_40s_linear_infinite]">
        <iframe
          src="https://sportscore.com/embed/fixtures/football/world-cup/"
          width="100%"
          height="40"
          style={{ border: 'none', overflow: 'hidden' }}
          title="World Cup Scores"
        />
      </div>
    </div>
  );
}