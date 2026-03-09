import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import {
  Menu,
  X,
  LogOut,
  Bell,
  CheckCircle,
  MessageCircle,
  XCircle,
  Clock,
  Megaphone,
  Calendar,
} from "lucide-react";
import liaLogo from "@/assets/lia-logo.png";
import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import gsap from "gsap";

// Context Integration
import { useAuth } from "@/contexts/AuthContext";
import { usePublicData } from "@/contexts/PublicDataContext";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Events", path: "/events" },
  { label: "Announcements", path: "/announcements" },
  { label: "Evaluation", path: "/evaluation" },
];

interface Notification {
  id: number;
  type:
    | "application_approved"
    | "application_rejected"
    | "application_pending"
    | "reply"
    | "comment"
    | "announcement"
    | "new_event";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "application_approved":
      return <CheckCircle className="h-4 w-4 text-success" />;

    case "application_rejected":
      return <XCircle className="h-4 w-4 text-destructive" />;

    case "reply":
      return <MessageCircle className="h-4 w-4 text-primary" />;

    case "comment":
      return <MessageCircle className="h-4 w-4 text-primary" />;

    case "announcement":
      return <Megaphone className="h-4 w-4 text-warning" />;

    case "new_event":
      return <Calendar className="h-4 w-4 text-primary" />;

    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

export function Header() {
  const { isStudentAuthenticated, userStudent, logoutStudent } = useAuth();
  const { isProfileAllowed, notifications, markNotificationRead } =
    usePublicData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const studentNotifications = notifications.filter(
    (n: any) => n.recipient === userStudent?._id
  );
  const location = useLocation();
  const navigate = useNavigate();

  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logoutStudent();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const unreadCount = studentNotifications.filter((n: any) => !n.isRead).length;
  const markAllAsRead = async () => {
    const unreadIds = studentNotifications
      .filter((n) => !n.isRead)
      .map((n) => n._id);

    if (!unreadIds.length) return;

    await markNotificationRead(unreadIds);

    studentNotifications.forEach((n) => (n.isRead = true));
    toast.success("All notifications marked as read");
  };

  const markAsRead = async (id: string) => {
    await markNotificationRead(id);
  };
  function formatNotificationType(type: string) {
    return type
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      logoRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6 }
    )
      .fromTo(
        navRef.current?.children || [],
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
        "-=0.3"
      )
      .fromTo(
        buttonRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.5 },
        "-=0.2"
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <div className="container flex h-16 items-center">
        <Link ref={logoRef} to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={liaLogo}
            alt="LIA Logo"
            className="h-14 w-14 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">
              LIA Leadership Portal
            </span>
            <span className="text-xs text-muted-foreground">
              Leadership & Accountability
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Centered */}
        <nav
          ref={navRef}
          className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors rounded-md hover:text-foreground hover:bg-secondary data-[active=true]:hover:bg-secondary"
              activeClassName="text-primary bg-secondary"
              end={item.path === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div
          ref={buttonRef}
          className="hidden lg:flex items-center gap-3 ml-auto"
        >
          {isStudentAuthenticated && userStudent ? (
            <>
              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative p-2 rounded-full hover:bg-secondary transition-colors focus:outline-none">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {studentNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-3 hover:bg-secondary/50 cursor-pointer transition-colors ${
                              !notification.isRead ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate">
                                    {formatNotificationType(notification.type)}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group relative focus:outline-none">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary/50 group-hover:scale-105 overflow-hidden flex items-center justify-center">
                      {/* Logic: if profile allowed AND image exists, show it. Else show initials */}
                      {isProfileAllowed && userStudent.profileImage ? (
                        <img
                          src={userStudent.profileImage}
                          alt={userStudent.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary-foreground">
                          {getInitials(userStudent.name)}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-background"></div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-card border shadow-lg"
                >
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/applications" className="cursor-pointer">
                      My Applications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile/Tablet Menu Toggle */}
        <button
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile/Tablet Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card animate-fade-in">
          {/* ScrollArea added for small screens */}
          <ScrollArea className="max-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="container py-4 flex flex-col gap-2">
              {/* Notifications Section - Only when logged in */}
              {isStudentAuthenticated && userStudent && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 px-1.5 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <ScrollArea className="h-[180px] rounded-lg border bg-secondary/30">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {notifications.slice(0, 4).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-3 hover:bg-secondary/50 cursor-pointer transition-colors ${
                              !notification.isRead ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex gap-2.5">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-medium truncate">
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground transition-colors rounded-md hover:text-foreground hover:bg-secondary data-[active=true]:hover:bg-secondary"
                    activeClassName="text-primary bg-secondary"
                    end={item.path === "/"}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              {/* Account Actions */}
              <div className="pt-3 border-t border-border mt-2">
                {isStudentAuthenticated && userStudent ? (
                  <div className="space-y-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Link
                        to="/applications"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Applications
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </header>
  );
}
