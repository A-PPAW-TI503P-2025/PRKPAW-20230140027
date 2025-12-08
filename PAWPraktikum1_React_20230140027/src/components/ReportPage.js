import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true); // Tambahan state loading
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:3001/api/reports/daily', config);
      setReports(response.data.data);
    } catch (err) {
      setError("Gagal mengambil data laporan.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // --- HELPER: Format Tanggal & Waktu ---
  const formatDate = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // --- HELPER: URL Gambar ---
  const getImageUrl = (path) => {
    if (!path) return null;
    const filename = path.split(/[\\/]/).pop();
    return `http://localhost:3001/uploads/${filename}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Laporan Presensi 📊</h1>
          <p className="text-gray-500 mt-1 text-sm">Rekap data kehadiran karyawan harian</p>
        </div>
        <button 
          onClick={fetchReports} 
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition-all flex items-center gap-2 text-sm font-medium"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* TABLE CARD */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        
        {loading ? (
          // SKELETON LOADING UI
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat data laporan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Karyawan</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Jam Masuk</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Jam Keluar</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lokasi (Lat, Long)</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Bukti Foto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.length > 0 ? (
                  reports.map((item, index) => (
                    <tr key={item.id} className="hover:bg-blue-50 transition-colors duration-200">
                      
                      {/* NAMA */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                            {item.User ? item.User.nama.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {item.User ? item.User.nama : "User Tidak Dikenal"}
                            </div>
                            <div className="text-xs text-gray-500">ID: {item.userId}</div>
                          </div>
                        </div>
                      </td>

                      {/* TANGGAL */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(item.checkIn)}
                      </td>

                      {/* JAM MASUK */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {formatTime(item.checkIn)} WIB
                        </span>
                      </td>

                      {/* JAM KELUAR */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {item.checkOut ? (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {formatTime(item.checkOut)} WIB
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">-- : --</span>
                        )}
                      </td>

                      {/* LOKASI */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                        <div>Lat: {item.latitude || "-"}</div>
                        <div>Lng: {item.longitude || "-"}</div>
                      </td>

                      {/* FOTO THUMBNAIL */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {item.buktiFoto ? (
                          <div className="relative group flex justify-center">
                            <img 
                              src={getImageUrl(item.buktiFoto)} 
                              alt="Bukti"
                              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer group-hover:scale-110 group-hover:rounded-lg transition-all duration-300"
                              onClick={() => setSelectedImage(getImageUrl(item.buktiFoto))}
                              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Error&background=random"; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                               <span className="bg-black bg-opacity-50 text-white text-[10px] px-1 rounded">Lihat</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">No Image</span>
                        )}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-lg font-medium">Belum ada data presensi hari ini.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL / POPUP FOTO FULL SIZE (Modern Backdrop) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center animate-fade-in-up">
            {/* Tombol Close */}
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition focus:outline-none"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Gambar Besar */}
            <img 
              src={selectedImage} 
              alt="Bukti Full Size" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl border-4 border-white"
            />
            <p className="text-white mt-4 text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default ReportPage;