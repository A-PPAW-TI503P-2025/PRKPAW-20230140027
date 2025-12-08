import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Webcam from 'react-webcam';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function PresensiPage() {
  const [coords, setCoords] = useState(null);
  const [message, setMessage] = useState('');
  const [locationStatus, setLocationStatus] = useState('Menunggu izin lokasi...');
  const [isLocationError, setIsLocationError] = useState(false);
  
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);

  const getLocation = () => {
    setIsLocationError(false);
    setLocationStatus('Sedang mengambil lokasi...');
    setMessage('');

    if (!navigator.geolocation) {
      setLocationStatus('Browser Anda tidak mendukung Geolocation.');
      setIsLocationError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('Lokasi ditemukan ✅');
        setIsLocationError(false);
      },
      (error) => {
        setIsLocationError(true);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('⛔ Izin lokasi ditolak! Mohon izinkan akses lokasi.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('⚠️ Informasi lokasi tidak tersedia.');
            break;
          case error.TIMEOUT:
            setLocationStatus('⏳ Waktu permintaan habis.');
            break;
          default:
            setLocationStatus('❌ Terjadi kesalahan lokasi.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  const handleCheckIn = async () => {
    const token = localStorage.getItem('token');
    if (!coords) {
      setMessage('Lokasi belum ditemukan!');
      getLocation();
      return;
    }
    if (!image) {
      setMessage('Harap ambil foto selfie terlebih dahulu!');
      return;
    }

    try {
      setMessage('Sedang mengirim data...');
      const blob = await (await fetch(image)).blob();

      const formData = new FormData();
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);
      formData.append('image', blob, 'selfie.jpg');

      const response = await axios.post('http://localhost:3001/api/presensi/check-in', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(response.data.message);
      setImage(null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-in gagal. Cek koneksi server.');
    }
  };

  const handleCheckOut = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:3001/api/presensi/check-out', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-out gagal');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center p-10">
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6 text-center tracking-wide">📍  PresensiPage</h2>

        <div className={`p-4 rounded-xl mb-6 text-center font-semibold shadow ${isLocationError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
          {locationStatus}
          {isLocationError && (
            <button onClick={getLocation} className="ml-2 underline font-medium text-red-700">
              Retry
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Map */}
          <div className="flex flex-col">
            <span className="font-bold text-gray-700 mb-3 text-lg">1. Verifikasi Lokasi</span>

            <div className="h-72 rounded-xl overflow-hidden shadow-lg border border-gray-300">
              {coords ? (
                <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[coords.lat, coords.lng]}>
                    <Popup>Lokasi Anda</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-200 animate-pulse text-gray-500">Memuat Peta...</div>
              )}
            </div>
          </div>

          {/* Camera */}
          <div className="flex flex-col">
            <span className="font-bold text-gray-700 mb-3 text-lg">2. Ambil Foto Selfie</span>

            <div className="h-72 bg-black border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: 'user' }}
                />
              )}
            </div>

            <button
              onClick={image ? () => setImage(null) : capture}
              className={`mt-4 py-2.5 rounded-lg font-semibold text-white shadow-md transition ${
                image ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {image ? '🔄 Ambil Ulang' : '📸 Ambil Foto'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex justify-center gap-6">
          <button
            onClick={handleCheckIn}
            disabled={!coords || !image}
            className={`px-10 py-3 text-lg rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 ${
              coords && image ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            ✅ CHECK IN
          </button>

          <button
            onClick={handleCheckOut}
            className="px-10 py-3 text-lg rounded-xl font-bold text-white shadow-lg bg-red-600 hover:bg-red-700 transition transform active:scale-95"
          >
            🚪 CHECK OUT
          </button>
        </div>

        {message && (
          <div
            className={`mt-8 p-5 text-center rounded-xl font-semibold shadow-md text-lg ${
              message.toLowerCase().includes('gagal') || message.toLowerCase().includes('error')
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default PresensiPage;
