export default function DashboardPage() {
  const cards = [
    { title: "Total Admin", value: 1 },
    { title: "Total Anggota", value: 130 },
    { title: "Stok Rendah", value: 12 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{c.title}</p>
            <h2 className="text-3xl font-bold text-blue-700 mt-2">{c.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
