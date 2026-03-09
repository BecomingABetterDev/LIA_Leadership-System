import { Link } from "react-router-dom";
import { useGsapFadeIn, useGsapStagger } from "@/hooks/useGsapAnimations";
import liaLogo from "@/assets/lia-logo.png";
import { useAuth } from "@/contexts/AuthContext";

export function Footer() {
  const logoRef = useGsapFadeIn<HTMLDivElement>();
  const linksRef = useGsapStagger<HTMLDivElement>(":scope > div", 0.15);
  const { userStudent } = useAuth();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div ref={linksRef} className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div ref={logoRef} className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
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
            <p className="text-muted-foreground text-sm max-w-md">
              Empowering high school students through transparent leadership,
              meaningful engagement, and accountable governance.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/announcements"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Announcements
                </Link>
              </li>
              <li>
                <Link
                  to="/evaluation"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Evaluation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={!userStudent ? "/login" : "/profile"}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to={!userStudent ? "/login" : "/profile"}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Leadership Interaction & Accountability
            System. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            School Leadership Department
          </p>
        </div>
      </div>
    </footer>
  );
}
