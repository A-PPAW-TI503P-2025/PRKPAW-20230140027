import React, { useState } from 'react';
import './App.css';

function App() {
  // Membuat state untuk menyimpan nama yang diinput pengguna
  const [nama, setNama] = useState('');

  // Fungsi untuk menangani perubahan pada input field
  const handleInputChange = (event) => {
    setNama(event.target.value);
  };
  

  return (
    <div className="App">
      <header className="App-header">
        <h1>Praktikum react</h1>

        {/* Input field untuk memasukkan nama */}
        <input
          type="text"
          placeholder="Masukkan nama Anda"
          value={nama}
          onChange={handleInputChange}
          style={{ padding: '10px', fontSize: '16px', margin: '20px 0' }}
        />

        {/* Menampilkan pesan sapaan jika nama sudah diinput */}
        {nama && <h2>Hello, {nama}!</h2>}
      </header>
    </div>
  );
}

export default App;