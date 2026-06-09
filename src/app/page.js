export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100">

      {/* Navbar */}
      <nav className="bg-red-900 text-white px-8 py-4 shadow-md">
        <h1 className="text-2xl font-bold">PARQIFY</h1>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h2 className="text-4xl font-bold text-red-900 mb-4">
          PUP Smart Parking System
        </h2>

        <p className="text-gray-600 text-lg mb-8">
          Find and reserve available parking slots in real-time.
        </p>

        <button className="bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition">
          Reserve Slot
        </button>
      </section>

      {/* Statistics Cards */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-red-900 font-bold text-xl">
              Parking Lot A
            </h3>
            <p className="text-3xl font-bold mt-3">20</p>
            <span className="text-gray-500">
              Available Slots
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-red-900 font-bold text-xl">
              Parking Lot B
            </h3>
            <p className="text-3xl font-bold mt-3">15</p>
            <span className="text-gray-500">
              Available Slots
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-red-900 font-bold text-xl">
              Occupied Slots
            </h3>
            <p className="text-3xl font-bold mt-3">35</p>
            <span className="text-gray-500">
              Currently Occupied
            </span>
          </div>

        </div>
      </section>

      {/* Parking Map */}
      <section className="max-w-6xl mx-auto px-6 mt-12">

        <h2 className="text-2xl font-bold text-red-900 mb-6">
          Parking Slot Overview
        </h2>

        <div className="bg-white rounded-xl shadow-md p-6">

          <div className="flex flex-wrap gap-4">

            <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
              A1
            </div>

            <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
              A2
            </div>

            <div className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
              A3
            </div>

            <div className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">
              A4
            </div>

            <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
              A5
            </div>

            <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
              A6
            </div>

          </div>

          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Occupied</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}