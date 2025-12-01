import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon marker Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function PresensiPage() {
  const [coords, setCoords] = useState(null);
  const [message, setMessage] = useState("");
  const [locationStatus, setLocationStatus] = useState("Menunggu izin lokasi...");
  const [isLocationError, setIsLocationError] = useState(false);

  const getLocation = () => {
    setIsLocationError(false);
    setLocationStatus("Sedang mengambil lokasi...");
    setMessage("");

    if (!navigator.geolocation) {
      setLocationStatus("Browser Anda tidak mendukung Geolocation.");
      setIsLocationError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus("Lokasi ditemukan ✅");
        setIsLocationError(false);
      },
      (error) => {
        setIsLocationError(true);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus("⛔ Izin lokasi ditolak! Mohon izinkan akses lokasi di browser.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus("⚠️ Informasi lokasi tidak tersedia. Pastikan GPS aktif.");
            break;
          case error.TIMEOUT:
            setLocationStatus("⏳ Waktu permintaan habis. Silakan coba lagi.");
            break;
          default:
            setLocationStatus("❌ Terjadi kesalahan saat mengambil lokasi.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } 
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  // --- FUNGSI CHECK IN ---
  const handleCheckIn = async () => {
    const token = localStorage.getItem('token');
    if (!coords) { getLocation(); return; }

    try {
      const response = await axios.post(
        'http://localhost:3001/api/presensi/check-in',
        { latitude: coords.lat, longitude: coords.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Check-in gagal");
    }
  };

  // --- FUNGSI CHECK OUT (BARU) ---
  const handleCheckOut = async () => {
    const token = localStorage.getItem('token');
    // Check out biasanya tidak butuh lokasi presisi, tapi jika mau validasi lokasi bisa ditambahkan logic coords
    
    try {
      const response = await axios.post(
        'http://localhost:3001/api/presensi/check-out',
        {}, // Body kosong (sesuai controller Anda yang tidak mewajibkan lokasi saat checkout)
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Check-out gagal");
    }
  };

  return (
    <div className="flex flex-col items-center p-8 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Presensi</h2>
      
      {/* Panel Status Lokasi */}
      <div className={`mb-6 p-4 rounded-lg shadow-sm w-full max-w-md text-center border ${isLocationError ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
        <p className={`font-medium ${isLocationError ? 'text-red-600' : 'text-green-600'}`}>
          {locationStatus}
        </p>
        {isLocationError && (
          <button onClick={getLocation} className="mt-2 text-sm text-blue-600 hover:underline">
            🔄 Coba Lagi
          </button>
        )}
      </div>

      {/* Peta */}
      {coords && (
        <div className="w-full max-w-md h-64 mb-6 rounded-lg overflow-hidden shadow-lg border border-gray-200 relative z-0">
          <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
            <Marker position={[coords.lat, coords.lng]}>
              <Popup>Lokasi Presensi Anda</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {/* Tombol Check-In & Check-Out */}
      <div className="flex gap-4">
        <button 
          onClick={handleCheckIn} 
          disabled={!coords}
          className={`px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all duration-200 ${
            coords ? 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Check In
        </button>

        <button 
          onClick={handleCheckOut} 
          className="px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all duration-200 bg-red-600 hover:bg-red-700 hover:-translate-y-0.5"
        >
          Check Out
        </button>
      </div>
      
      {/* Pesan Sukses/Gagal */}
      {message && (
        <div className={`mt-6 p-4 rounded-lg border text-center w-full max-w-md ${message.toLowerCase().includes("gagal") || message.toLowerCase().includes("error") ? "bg-red-100 border-red-400 text-red-700" : "bg-green-100 border-green-400 text-green-700"}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default PresensiPage;