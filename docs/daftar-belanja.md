# Daftar belanja hardware Topi Surya

Harga tidak ditulis karena berubah-ubah menurut toko dan waktu; yang
ditulis adalah spesifikasi yang harus dipenuhi supaya firmware dan
wiring di repo ini langsung cocok. Beli secukupnya, dan cek ulang
spesifikasi kipas sebelum memakai angka statistik energi di dasbor.

| Komponen | Spesifikasi | Catatan |
| --- | --- | --- |
| ESP32 DevKit | Board 30 pin, WiFi | Otak perangkat + pengirim telemetri |
| Panel surya | 6 V, ukuran muat di atas topi | Sumber tenaga; tegangan dibaca lewat pembagi |
| Kipas DC | 5 V, arus kecil (sekitar 0,2 A) | Statistik energi dasbor berasumsi 1 W — sesuaikan bila kipas berbeda |
| Sensor DHT22 | Bukan DHT11 | Akurasi dan rentang DHT22 yang dipakai firmware |
| MOSFET logic-level | Mis. IRLZ44N, atau modul driver kipas | Kipas tidak boleh digerakkan langsung dari GPIO |
| Resistor 30k | 1 buah | R1 pembagi tegangan panel |
| Resistor 7,5k | 1 buah | R2 pembagi tegangan panel |
| Resistor 10k | 1 buah | Pull-up data DHT22 |
| Kabel jumper + breadboard / PCB prototipe | Secukupnya | Rakit dan uji di meja dulu |
| Topi | Cukup kokoh menahan panel + board | Tempat seluruh perangkat dipasang |
| Catu cadangan (opsional) | Powerbank kecil / baterai 5 V | Supaya kipas tetap jalan saat mendung; panel saja tidak menyimpan energi |

## Yang sudah dimiliki vs. belum

- Perangkat keras fisik (ESP32, panel, kipas, topi) adalah bagian
  pembangun — repo ini hanya menyediakan server, firmware, dan
  simulatornya. Uji tanpa hardware memakai simulator:
  `node simulator/simulator.mjs`.
