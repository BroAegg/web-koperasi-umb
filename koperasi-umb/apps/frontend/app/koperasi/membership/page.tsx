export default function MembershipPage() {
  const members = [
    { name: "Richard Martin", gender: "Laki-laki", email: "richard@mail.com", unit: "Keuangan", pokok: 50000, sukarela: 150000 },
    { name: "Siti Rahma", gender: "Perempuan", email: "siti@mail.com", unit: "HRD", pokok: 50000, sukarela: 100000 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Membership</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-gray-800 text-sm rounded-lg overflow-hidden">
            <thead className="bg-blue-100 border-b border-gray-300 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nama Anggota</th>
                <th className="px-4 py-3 text-left font-semibold">Gender</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Unit Kerja</th>
                <th className="px-4 py-3 text-left font-semibold">Simpanan Pokok</th>
                <th className="px-4 py-3 text-left font-semibold">Simpanan Sukarela</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-300 hover:bg-blue-50 transition-colors"
                >
                  <td className="px-4 py-2 font-medium">{m.name}</td>
                  <td className="px-4 py-2">{m.gender}</td>
                  <td className="px-4 py-2">{m.email}</td>
                  <td className="px-4 py-2">{m.unit}</td>
                  <td className="px-4 py-2 text-blue-700 font-semibold">
                    Rp {m.pokok.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-blue-700 font-semibold">
                    Rp {m.sukarela.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
