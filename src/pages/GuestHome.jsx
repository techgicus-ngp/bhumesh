// screens/guest_home.dart
import { useNavigate } from 'react-router-dom';
import { LogOut, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MapsTab from '../components/MapsTab';

export default function GuestHome() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="page">
      <div className="hero">
        <div className="container">
          <div className="row">
            <div>
              <small>GUEST ACCESS</small>
              <h2>Explore Layout Maps</h2>
              <p>Welcome, {user.name}</p>
            </div>
            <button className="icon-btn light" onClick={logout} title="Sign out"><LogOut /></button>
          </div>
          <div className="hero-note">
            <Info size={20} />
            <span>Guest users can view maps and plot details but cannot create quotations</span>
          </div>
        </div>
      </div>
      <div className="container"><MapsTab onOpen={(m) => nav(`/maps/${m.id}`)} /></div>
    </div>
  );
}
