const PERANGKAT = [
  { nama: "ESP32 DevKit", peran: "Mikrokontroler + WiFi, otak perangkat" },
  { nama: "Panel surya 6V", peran: "Sumber tenaga kipas" },
  { nama: "Kipas DC 5V", peran: "Pendingin di dalam topi" },
  { nama: "Sensor DHT22", peran: "Suhu dan kelembapan" },
  { nama: "Pembagi tegangan", peran: "Membaca tegangan panel lewat ADC" },
  { nama: "Topi", peran: "Tempat seluruh perangkat dipasang" },
];

export default function BagianPerangkat() {
  return (
    <section id="perangkat" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          Perangkat yang dibutuhkan
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Perangkat keras adalah bagianmu; repo ini menyediakan server,
          firmware, dan simulatornya. Daftar belanja lengkap dan diagram
          wiring menyusul bersama firmware.
        </p>
        <table className="mt-8 w-full border-collapse border-y border-line text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-3 pr-4 font-mono text-xs tracking-widest uppercase">
                Komponen
              </th>
              <th scope="col" className="py-3 font-mono text-xs tracking-widest uppercase">
                Peran
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {PERANGKAT.map((item) => (
              <tr key={item.nama}>
                <td className="py-3 pr-4 font-semibold">{item.nama}</td>
                <td className="py-3 text-muted">{item.peran}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
