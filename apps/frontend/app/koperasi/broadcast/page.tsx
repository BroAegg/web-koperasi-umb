export default function BroadcastPage() {
  const stats = [
    { label: "Total Broadcast", value: 15 },
    { label: "Completed", value: 1600 },
    { label: "Total Message", value: 10 },
    { label: "Success Rate", value: "80%" },
    { label: "Total Contact", value: 15 },
    { label: "Contact Groups", value: 10 },
    { label: "Active Group", value: 15 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Broadcast</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">{s.label}</p>
            <h2 className="text-2xl font-bold text-blue-700 mt-2">{s.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
