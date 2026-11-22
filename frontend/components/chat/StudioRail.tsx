/**
 * B1 primary rail (72px). Derived from the old ChatSidebar's profile/actions
 * and restyled as an icon rail; the full thread list moved to StudioOutline.
 */
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Moon,
  Plus,
  Settings,
  Sun,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface StudioRailProps {
  user: any;
  onNewSession: () => void;
  isSending?: boolean;
}

export function StudioRail({ user, onNewSession, isSending = false }: StudioRailProps) {
  const { isLight, toggleTheme } = useTheme();

  const buttonClass =
    'flex h-11 w-11 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground';

  return (
    <aside className="hidden w-[72px] flex-col items-center border-r border-border bg-card/60 py-4 md:flex">
      <Link
        to="/"
        className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-black text-white shadow-lg shadow-indigo-950/30"
        title="Pocket Lawyer"
      >
        PL
      </Link>

      <button
        type="button"
        onClick={onNewSession}
        disabled={isSending}
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-950/30 transition-transform hover:bg-indigo-500 active:scale-95 disabled:opacity-40"
        title="New chat"
      >
        <Plus size={19} />
      </button>

      <div className="flex flex-col gap-2">
        <Link to="/dashboard" className={buttonClass} title="Dashboard">
          <LayoutDashboard size={18} />
        </Link>
        <Link to="/settings" className={buttonClass} title="Settings">
          <Settings size={18} />
        </Link>
        <button type="button" onClick={toggleTheme} className={buttonClass} title="Toggle theme">
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="mt-auto flex flex-col items-center gap-3">
        <Link
          to="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white transition-transform hover:scale-105"
          title={user?.full_name || user?.name || user?.email || 'Account settings'}
        >
          {(user?.full_name || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
        </Link>
      </div>
    </aside>
  );
}
