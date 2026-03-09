import { useEffect, useRef } from "react";
import { useLocation, useNavigate, Outlet, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Award,
  FileCheck,
  Activity,
  UsersRound,
  MessageSquare,
  UserCog,
  GraduationCap,
  CalendarClock,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLogin from "./AdminLogin";
import { cn } from "@/lib/utils"; // for conditional classNames

const adminNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Student Results", url: "/admin/students", icon: Users },
  { title: "Token Distribution", url: "/admin/tokens", icon: Award },
  { title: "Events & Approvals", url: "/admin/events", icon: FileCheck },
  { title: "Event Status", url: "/admin/status", icon: Activity },
  { title: "Club Management", url: "/admin/clubs", icon: UsersRound },
  { title: "Feedback", url: "/admin/feedback", icon: MessageSquare },
  { title: "Account Management", url: "/admin/accounts", icon: UserCog },
  {
    title: "Evaluation Settings",
    url: "/admin/evaluation",
    icon: GraduationCap,
  },
  {
    title: "Trimester Transition",
    url: "/admin/trimester",
    icon: CalendarClock,
  },
];

export default function AdminLayout() {
  const { authenticatedAdmin, logoutAdmin } = useAuth();

  if (!authenticatedAdmin) return <AdminLogin />;

  return (
    <SidebarProvider>
      <AdminSidebarContent logoutAdmin={logoutAdmin} />
    </SidebarProvider>
  );
}

function AdminSidebarContent({
  logoutAdmin,
}: {
  logoutAdmin: () => Promise<void>;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile, isMobile } = useSidebar();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  const handleNavClick = (url: string) => {
    if (isMobile) setOpenMobile(false);
    navigate(url);
    window.scrollTo(0, 0);
  };

  const isActive = (url: string, end?: boolean) => {
    const currentPath = location.pathname;
    return end ? currentPath === url : currentPath.startsWith(url);
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      window.location.href = "/admin";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar className="border-r border-sidebar-border">
        <div className="p-3 sm:p-4 border-b border-sidebar-border animate-fade-in">
          <Link to="/?from=admin" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg gradient-hero transition-transform duration-300 group-hover:scale-105">
              <UserCog className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">
                Leadership
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Administration
              </span>
            </div>
          </Link>
        </div>

        <SidebarContent className="flex flex-col h-full">
          <SidebarGroup className="flex-1">
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs px-2">
              Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item, index) => {
                  const active = isActive(item.url, item.end);
                  return (
                    <SidebarMenuItem
                      key={item.title}
                      className="animate-slide-in-left opacity-0"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => handleNavClick(item.url)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 w-full rounded-md text-sidebar-foreground/80 transition-all duration-200 press-effect",
                            active
                              ? "bg-sidebar-accent text-sidebar-primary pointer-events-none"
                              : "hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-1"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Logout */}
          <div className="p-3 sm:p-4 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sidebar-foreground/80 hover:bg-destructive/10 hover:text-destructive hover:translate-x-1 press-effect"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-12 sm:h-14 border-b border-border bg-card flex items-center px-3 sm:px-4 gap-3 sm:gap-4 sticky top-0 z-10 animate-fade-in-down">
          <SidebarTrigger className="shrink-0 transition-transform duration-200 hover:scale-110 press-effect" />
          <h1 className="font-semibold text-foreground text-sm sm:text-base truncate">
            Leadership Administration
          </h1>
        </header>
        <main
          ref={mainRef}
          className="flex-1 p-4 sm:p-6 overflow-auto animate-fade-in-up"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
