import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
export default function Register(){
 const {register}=useAuth(), nav=useNavigate(); const [form,setForm]=useState({name:'',email:'',password:''}); const [error,setError]=useState('');
 const submit=async e=>{e.preventDefault();try{await register(form);nav('/')}catch(x){setError(x.response?.data?.error||'Registration failed')}};
 return <div className="auth-page"><form className="auth-card" onSubmit={submit}><h1>Create planner</h1><p>Build your own breakfast-to-dinner menu.</p><StatusMessage error={error} />
 <input required placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
 <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
 <input required minLength="8" type="password" placeholder="Password (8+ characters)" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
 <button className="primary">Create account</button><p>Already registered? <Link to="/login">Login</Link></p></form></div>
}
