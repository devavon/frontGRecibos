/* "use client";
import React, {useState } from 'react'
import Label from './Label'; 
import Form from './Form';
import Swal from 'sweetalert2'
import './Style.css';

export default function LoginComp() {

    const[nombreUsuario,setNombreUsuario]=useState("")
    const[passwordUsuario,setPasswordUsuario]=useState("")
    const [loading, setLoading] = useState(false); 

    function nombre(e) {
      setNombreUsuario(e.target.value)
    }

    function password(e) {
      setPasswordUsuario(e.target.value)
    }

const btnIniciar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreUsuario, passwordUsuario }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      if (data.access && data.refresh) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        if (data.role) localStorage.setItem('role', data.role);
        if (data.id) localStorage.setItem('user_id', data.id);
        Swal.fire({ icon: 'success', title: 'Bienvenido' });
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setLoading(false);
    }
  };
  

  return (
     <div className="login-container">
        <h3 className="tit">Iniciar sesión</h3>

        <label className="label" htmlFor="nombre">Nombre</label>
        <input className="input" id="name" type="text" value={nombreUsuario} onChange={nombre} />

        <label className="label" htmlFor="password">Contraseña</label>
        <input className="input" id="contrasena" type="password" value={passwordUsuario} onChange={password} />

        <button className="butt" onClick={btnIniciar}>INGRESAR</button>
    </div>
  )
} */