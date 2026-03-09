import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGsapHero } from "@/hooks/useGsapAnimations";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicData } from "@/contexts/PublicDataContext";

const heroSlides = [
  {
    badge: "LIA Leadership Platform",
    heading: "Leadership, Transparency, Engagement",
    description:
      "A comprehensive system designed to track student leadership activities, reward participation, and foster accountability within our school community.",
  },
  {
    badge: "Track Your Progress",
    heading: "Earn Tokens, Rise Through Ranks",
    description:
      "Participate in events, attend club meetings, and demonstrate leadership to earn Savannah tokens and climb the leaderboard.",
  },
  {
    badge: "Community Driven",
    heading: "Events, Clubs & Collaboration",
    description:
      "Join school-wide events, lead clubs, and engage with peers to build a vibrant, accountable student community.",
  },
];

export function HeroSection() {
  const heroRef = useGsapHero<HTMLDivElement>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { students } = useAuth();
  const { adminSettings } = usePublicData();

  const dynamicStats = useMemo(() => {
    // 1. Active Students: Raw count, no plus sign
    const studentCount = students?.length || 0;

    // 2. Events Hosted: Decrease by 1 and add plus sign
    const eventCount = adminSettings?.totalEventsHosted
      ? Math.max(0, adminSettings.totalEventsHosted - 1)
      : 0;

    // 3. Tokens Distributed: Decrease by 1 and add plus sign
    const tokenCount = adminSettings?.totalTokensDistributed
      ? Math.max(0, adminSettings.totalTokensDistributed - 1)
      : 0;

    return [
      {
        icon: Users,
        label: "Active Students",
        value: studentCount.toString(),
      },
      {
        icon: Calendar,
        label: "Events Hosted",
        value: `${eventCount}+`,
      },
      {
        icon: Award,
        label: "Tokens Distributed",
        value: `${tokenCount.toLocaleString()}+`,
      },
    ];
  }, [students, adminSettings]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    // Restored original padding: py-24 lg:py-32
    <section className="relative overflow-hidden gradient-hero py-24 lg:py-22">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 animate-grid-pulse"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent animate-scan-horizontal" />
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent animate-scan-vertical" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, hsl(270 70% 30% / 0.4) 100%)",
          }}
        />
      </div>

      <div className="container relative" ref={heroRef}>
        <div className="hidden md:block max-w-3xl mx-auto text-center">
          <div
            data-hero-badge
            // Restored original margin: mb-6
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-6"
          >
            <Award className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">
              LIA Leadership Platform
            </span>
          </div>

          <h1
            data-hero-heading
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-6 leading-relaxed pb-2"
          >
            Leadership, Transparency, Engagement
          </h1>

          <p
            data-hero-description
            className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
            style={{ fontFamily: "'Macondo', cursive" }}
          >
            A comprehensive system designed to track student leadership
            activities, reward participation, and foster accountability within
            our school community.
          </p>

          <div data-hero-buttons className="flex flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary font-semibold hover:bg-white/90 shadow-lg px-8"
            >
              <Link to="/events">
                Browse Events <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/15 text-white font-semibold border border-white/30 hover:bg-white/25 backdrop-blur-sm px-8"
            >
              <Link to="/evaluation">How It Works</Link>
            </Button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <div className="relative overflow-hidden rounded-2xl mx-1">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {heroSlides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 min-h-[280px] flex flex-col justify-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 mb-4 self-center">
                      <Award className="h-3.5 w-3.5 text-primary-foreground" />
                      <span className="text-xs font-medium text-primary-foreground">
                        {slide.badge}
                      </span>
                    </div>
                    <h1 className="text-2xl font-display font-bold text-primary-foreground mb-3 leading-tight">
                      {slide.heading}
                    </h1>
                    <p
                      className="text-sm text-primary-foreground/75 leading-relaxed px-8"
                      style={{ fontFamily: "'Macondo', cursive" }}
                    >
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-primary-foreground z-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-primary-foreground z-10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-row gap-2 mt-6 px-6">
            <Button
              asChild
              size="sm"
              className="bg-white text-primary font-semibold hover:bg-white/90 shadow-lg flex-1 text-xs h-9"
            >
              <Link to="/events">
                Browse Events <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-white/15 text-white font-semibold border border-white/30 hover:bg-white/25 backdrop-blur-sm flex-1 text-xs h-9"
            >
              <Link to="/evaluation">How It Works</Link>
            </Button>
          </div>
        </div>

        {/* Stats Section - Restored original margin: mt-16 */}
        <div
          data-hero-stats
          className="hidden md:grid grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto"
        >
          {dynamicStats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/20">
                <stat.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-primary-foreground/70">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Stats */}
        <div className="md:hidden mt-8 overflow-hidden px-4">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {dynamicStats.map((stat, index) => (
              <div key={index} className="w-full flex-shrink-0 px-1">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
                    <stat.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-primary-foreground/70">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
