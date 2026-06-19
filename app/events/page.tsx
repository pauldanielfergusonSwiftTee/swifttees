export default function EventsPage() {
  const events = [
    {
      title: "The Belfry Weekend",
      date: "July 2026",
      status: "Next Event",
      description: "The next Swift Tees trip. Scores, photos and controversy incoming.",
    },
    {
      title: "Weekend 1",
      date: "2025",
      status: "Past Event",
      description: "Write-up and photos coming soon.",
    },
    {
      title: "Weekend 2",
      date: "2025",
      status: "Past Event",
      description: "Write-up and photos coming soon.",
    },
    {
      title: "Weekend 3",
      date: "2025",
      status: "Past Event",
      description: "Write-up and photos coming soon.",
    },
    {
      title: "Weekend 4",
      date: "2025",
      status: "Past Event",
      description: "Write-up and photos coming soon.",
    },
  ];

  return (
    <main className="min-h-screen bg-green-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-6xl font-bold mb-2">Events</h1>

        <p className="text-green-300 mb-10">
          Past weekends, future trips and society history.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.title}
              className="bg-green-900 rounded-2xl p-6 border border-green-800"
            >
              <p className="text-sm text-green-300 font-bold mb-2">
                {event.status}
              </p>

              <h2 className="text-2xl font-bold mb-2">{event.title}</h2>

              <p className="text-green-200 mb-4">{event.date}</p>

              <p className="text-green-100">{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}