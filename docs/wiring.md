# Diagram wiring Topi Surya

Semua nomor pin mengacu pada firmware `firmware/topi-surya.ino`.
ESP32 yang dipakai adalah board DevKit (30 pin); bila board berbeda,
sesuaikan nomor GPIO-nya, bukan nama pin D-nya.

## Koneksi

| Dari | Ke | Keterangan |
| --- | --- | --- |
| ESP32 3V3 | DHT22 VCC | Catu sensor |
| ESP32 GND | DHT22 GND | Ground bersama |
| ESP32 GPIO 4 | DHT22 DATA | Data sensor, dengan resistor pull-up 10k ke 3V3 |
| Panel surya (+) | R1 30k | Ujung atas pembagi tegangan |
| R1 30k — R2 7,5k | ESP32 GPIO 34 (ADC) | Titik tengah pembagi, dibaca firmware |
| R2 7,5k | GND | Ujung bawah pembagi |
| Panel surya (−) | GND | Ground bersama |
| ESP32 GPIO 18 | Gerbang MOSFET / basis transistor driver kipas | PWM 25 kHz dari firmware |
| Driver kipas | Kipas DC 5V | Kipas tidak digerakkan langsung dari GPIO |
| Catu 5V (panel / baterai) | Kipas + driver | Jalur daya kipas, terpisah dari logika 3,3 V |

## Sketsa (tampak atas, bukan skala)

```
Panel surya 6V (+) ── R1 30k ──┬── GPIO 34 (ADC ESP32)
                               │
Panel surya (−) ─── GND ─────── R2 7,5k ── GND

DHT22 VCC ── 3V3      DHT22 DATA ── GPIO 4 (+ pull-up 10k ke 3V3)
DHT22 GND ── GND

GPIO 18 (PWM) ── driver MOSFET ── kipas DC 5V ── catu 5V
```

## Catatan penting

- **Jangan hubungkan panel langsung ke GPIO 34.** Panel 6 V melebihi
  batas ADC 3,3 V; pembagi tegangan wajib ada. Faktor firmware (5x)
  dihitung dari R1 30k dan R2 7,5k — bila resistor diganti, ubah
  `DIVIDER_FACTOR` di firmware.
- **GPIO 34 hanya input** (ADC1), cocok untuk baca tegangan; jangan
  dipakai untuk menggerakkan apa pun.
- **Kipas tidak boleh disambung langsung ke GPIO.** Arus start kipas
  DC jauh di atas kemampuan pin ESP32; pakai MOSFET logic-level
  (mis. IRLZ44N) atau modul driver, dengan dioda flyback bila driver
  berupa transistor.
- **Ground harus bersama**: GND ESP32, GND panel, dan GND catu kipas
  disatukan, kalau tidak pembacaan ADC dan PWM tidak bisa dipercaya.
- **DHT22 di dalam topi** membaca suhu di sekitar kepala, bukan suhu
  luar — itu memang yang diinginkan untuk kontrol kipas.
- Uji di meja dulu: panel di bawah lampu / sinar matahari, dasbor
  menampilkan tegangan naik, lalu pasang ke topi.
