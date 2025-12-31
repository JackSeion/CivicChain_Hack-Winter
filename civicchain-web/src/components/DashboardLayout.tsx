import { ReactNode } from "react";
import { Button } from "./ui/button";
import { LayoutDashboard, TrendingUp, Award, LogOut, Building2, Home, FileText, Sparkles, HelpCircle, Brain } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  municipalName?: string;
}

export function DashboardLayout({ children, currentPage, onNavigate, onLogout, municipalName }: DashboardLayoutProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'departments', label: 'Departments', icon: LayoutDashboard },
    { id: 'ai-insights', label: 'AI Models', icon: Brain },
    { id: 'performance', label: 'Performance', icon: Award },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  // Municipal dashboard with sidebar
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-gray-900 truncate">{municipalName || 'Municipal'}</h2>
              <p className="text-sm text-gray-500">Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
