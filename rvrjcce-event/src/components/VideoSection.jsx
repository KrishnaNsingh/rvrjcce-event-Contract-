import React, { useState, useRef, useEffect, useCallback } from '../core/react.js';

export function VideoSection({
  localVideoSrc = "/video/Rvrjc.mp4",
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);
  const clipPathRef = useRef(null);
  const borderPathRef = useRef(null);
  const borderSvgRef = useRef(null);
  const titleRef = useRef(null);

  // SVG Normalized Flag contour path (as provided in design spec)
  const PATH_FLAG =
    "M 0.57148 0.0 C 0.28571 0.0, 0.28571 0.28043, 0.0 0.28043 V 1.0 C 0.22794 1.0, 0.27404 0.82154, 0.4285 0.74941 V 1.0 C 0.71427 1.0, 0.71427 0.71958, 1.0 0.71958 V 0.0 C 0.77204 0.0, 0.72594 0.17846, 0.57148 0.25059 V 0.0 Z";

  const FLAG_NUMS = [
    0.57148, 0.0, 0.28571, 0.0, 0.28571, 0.28043, 0.0, 0.28043, 1.0, 0.22794,
    1.0, 0.27404, 0.82154, 0.4285, 0.74941, 1.0, 0.71427, 1.0, 0.71427, 0.71958,
    1.0, 0.71958, 0.0, 0.77204, 0.0, 0.72594, 0.17846, 0.57148, 0.25059, 0.0,
  ];

  const RECT_NUMS = [
    0.57148, 0.0, 0.28571, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.22794,
    1.0, 0.4285, 1.0, 0.4285, 1.0, 1.0, 0.71427, 1.0, 1.0, 1.0,
    1.0, 1.0, 0.0, 0.77204, 0.0, 0.57148, 0.0, 0.57148, 0.0, 0.0,
  ];

  const interpolatePath = useCallback((p) => {
    const n = FLAG_NUMS.map((f, i) => (f + (RECT_NUMS[i] - f) * p).toFixed(5));
    return `M ${n[0]} ${n[1]} C ${n[2]} ${n[3]}, ${n[4]} ${n[5]}, ${n[6]} ${n[7]} V ${n[8]} C ${n[9]} ${n[10]}, ${n[11]} ${n[12]}, ${n[13]} ${n[14]} V ${n[15]} C ${n[16]} ${n[17]}, ${n[18]} ${n[19]}, ${n[20]} ${n[21]} V ${n[22]} C ${n[23]} ${n[24]}, ${n[25]} ${n[26]}, ${n[27]} ${n[28]} V ${n[29]} Z`;
  }, []);

  // Guarantee muted setup for autonomous browser autoplay policy compliance
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
    }
  }, []);

  // IntersectionObserver: Auto-run on reaching this section, pause when scrolled away
  useEffect(() => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const playVideo = () => {
      video.muted = isMuted;
      const promise = video.play();
      if (promise !== undefined) {
        promise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // If browser blocks unmuted playback, reliably fallback to muted autoplay
            video.muted = true;
            setIsMuted(true);
            video.play()
              .then(() => setIsPlaying(true))
              .catch(() => {});
          });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playVideo();
          } else {
            if (!video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(wrapper);

    // Initial viewport check
    const rect = wrapper.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      playVideo();
    }

    return () => {
      observer.disconnect();
    };
  }, [isMuted]);

  // Handle video readiness and seamless perfect loop
  const handleLoadedData = () => {
    setVideoLoaded(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Toggle Mute / Sound On
  const toggleSound = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  // Toggle Play / Pause on user click
  const togglePlayback = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Resilient multi-source fallback on video error
  const handleVideoError = (e) => {
    console.warn("Primary video src fallback check...", e);
    const video = videoRef.current;
    if (video && video.src !== localVideoSrc) {
      video.src = localVideoSrc;
      video.load();
      video.play().catch(() => {});
    }
  };

  // Scroll Scrubbing Morph Engine
  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const wrapper = wrapperRef.current;
      const card = cardRef.current;
      const clipPath = clipPathRef.current;
      const borderPath = borderPathRef.current;
      const borderSvg = borderSvgRef.current;
      const title = titleRef.current;

      if (!wrapper || !card) return;

      const rect = wrapper.getBoundingClientRect();
      const totalDist = wrapper.offsetHeight - window.innerHeight;
      if (totalDist <= 0) return;

      const scrolled = -rect.top;
      const rawProgress = scrolled / totalDist;
      const progress = Math.max(0, Math.min(1, rawProgress));

      // Ease progress curve for natural physics & feel
      const p =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      const isMobile = window.innerWidth < 768;
      const startWidthVw = isMobile ? 88 : 70;
      const maxContainerPx = isMobile ? 600 : 1160;

      if (progress <= 0.001) {
        card.style.width = `${startWidthVw}vw`;
        card.style.maxWidth = `${maxContainerPx}px`;
        card.style.height = "auto";
        card.style.aspectRatio = "24.57 / 13.85";
        card.style.clipPath = "url(#video-flag-clip)";
        card.style.setProperty("-webkit-clip-path", "url(#video-flag-clip)");
        if (clipPath) clipPath.setAttribute("d", PATH_FLAG);
        if (borderPath) borderPath.setAttribute("d", PATH_FLAG);
        if (borderSvg) borderSvg.style.opacity = "1";
        if (title) title.style.opacity = "0";
      } else if (progress >= 0.99) {
        card.style.width = "100vw";
        card.style.maxWidth = "100vw";
        card.style.height = "100vh";
        card.style.aspectRatio = "unset";
        card.style.clipPath = "none";
        card.style.setProperty("-webkit-clip-path", "none");
        const pathRect = interpolatePath(1);
        if (clipPath) clipPath.setAttribute("d", pathRect);
        if (borderPath) borderPath.setAttribute("d", pathRect);
        if (borderSvg) borderSvg.style.opacity = "0";
        if (title) title.style.opacity = "1";
      } else {
        const pClamped = Math.min(1, Math.max(0, p));
        const wVw = (startWidthVw + (100 - startWidthVw) * pClamped).toFixed(3);
        const maxPx = (maxContainerPx * (1 - pClamped)).toFixed(1);
        const maxVw = (100 * pClamped).toFixed(3);
        const hVw = (((startWidthVw * 13.85) / 24.57) * (1 - pClamped)).toFixed(3);
        const hVh = (100 * pClamped).toFixed(3);

        card.style.width = `${wVw}vw`;
        card.style.maxWidth = `calc(${maxPx}px + ${maxVw}vw)`;
        card.style.height = `calc(${hVw}vw + ${hVh}vh)`;
        card.style.aspectRatio = "unset";
        card.style.clipPath = "url(#video-flag-clip)";
        card.style.setProperty("-webkit-clip-path", "url(#video-flag-clip)");

        const currentD = interpolatePath(pClamped);
        if (clipPath) clipPath.setAttribute("d", currentD);
        if (borderPath) borderPath.setAttribute("d", currentD);
        if (borderSvg) borderSvg.style.opacity = String(Math.max(0, 1 - pClamped * 1.5));
        
        // Title overlay gracefully fades in during card expansion
        if (title) {
          title.style.opacity = String(Math.min(1, Math.max(0, (pClamped - 0.15) * 1.8)));
        }
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    const interval = setInterval(update, 250);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearInterval(interval);
    };
  }, [interpolatePath]);

  return (
    <section
      ref={wrapperRef}
      id="campus-video-section"
      className="video-reveal-wrapper"
      style={{
        position: "relative",
        width: "100%",
        height: "230vh", // Provides scroll space for morphing GSAP-like scrub reveal
        backgroundColor: "#07080b",
        zIndex: 20,
      }}
    >
      {/* SVG ClipPath Definition (Normalized [0,1] objectBoundingBox coordinates) */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none", opacity: 0 }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="video-flag-clip" clipPathUnits="objectBoundingBox">
            <path ref={clipPathRef} id="video-flag-path" d={PATH_FLAG} />
          </clipPath>
        </defs>
      </svg>

      {/* Sticky Viewport Frame pinned during scroll */}
      <div
        className="video-reveal-sticky"
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: "#07080b",
        }}
      >
        {/* Ambient Dark Navy/Graphite Radial Depth Glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 75% 65% at 50% 50%, rgba(14, 34, 61, 0.45) 0%, rgba(7, 8, 11, 0.95) 75%, #07080b 100%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Decorative Stepped Accent Motif Right (Directly matching reference image 1) */}
        <div
          className="video-stepped-accent-right"
          style={{
            position: "absolute",
            right: 0,
            bottom: "8%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            pointerEvents: "none",
            zIndex: 1,
            opacity: 0.9,
          }}
        >
          <div
            style={{
              width: "clamp(80px, 9vw, 120px)",
              height: "clamp(24px, 2.5vw, 36px)",
              background: "linear-gradient(90deg, #9333ea, #db2777)",
              boxShadow: "0 0 25px rgba(219, 39, 119, 0.35)",
            }}
          />
          <div
            style={{
              width: "clamp(130px, 14vw, 190px)",
              height: "clamp(28px, 3vw, 42px)",
              background: "linear-gradient(90deg, #7e22ce, #c026d3)",
            }}
          />
          <div
            style={{
              width: "clamp(190px, 20vw, 270px)",
              height: "clamp(34px, 3.5vw, 50px)",
              background: "linear-gradient(90deg, #6b21a8, #9333ea)",
            }}
          />
          <div
            style={{
              width: "clamp(260px, 27vw, 370px)",
              height: "clamp(42px, 4.5vw, 68px)",
              background: "linear-gradient(90deg, #4c1d95, #6b21a8)",
            }}
          />
        </div>

        {/* Decorative Stepped Silhouette Left (Directly matching reference image 1) */}
        <div
          className="video-stepped-accent-left"
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            pointerEvents: "none",
            zIndex: 1,
            opacity: 0.85,
          }}
        >
          <div
            style={{
              width: "clamp(120px, 15vw, 220px)",
              height: "clamp(28px, 3.5vw, 45px)",
              background: "#0c1017",
            }}
          />
          <div
            style={{
              width: "clamp(200px, 24vw, 340px)",
              height: "clamp(40px, 5vw, 70px)",
              background: "#07080b",
            }}
          />
        </div>

        {/* Video Card Anchor */}
        <div
          className="video-reveal-anchor"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            cursor: "pointer",
          }}
          onClick={togglePlayback}
          title="Click to play / pause video"
        >
          {/* Expanding & Morphing Video Card */}
          <div
            ref={cardRef}
            className="video-reveal-card"
            style={{
              position: "relative",
              width: "64vw",
              maxWidth: "1080px",
              aspectRatio: "24.57 / 13.85",
              clipPath: "url(#video-flag-clip)",
              WebkitClipPath: "url(#video-flag-clip)",
              overflow: "hidden",
              backgroundColor: "#050505",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter:
                "drop-shadow(0 30px 70px rgba(0, 0, 0, 0.8)) drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5))",
              willChange: "transform, width, height",
              transition: "none",
            }}
          >
            {/* HTML5 Video Element with Multi-Path Fallback */}
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={handleLoadedData}
              onEnded={handleEnded}
              onError={handleVideoError}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                backgroundColor: "#07080b",
              }}
            >
              <source src="/video/Rvrjc.mp4" type="video/mp4" />
              <source src="./video/Rvrjc.mp4" type="video/mp4" />
              <source src="video/Rvrjc.mp4" type="video/mp4" />
              Your browser does not support high-definition video playback.
            </video>

            {/* Cinematic Title Overlay (Reveals when card expands, matching reference image 2) */}
            <div
              ref={titleRef}
              className="video-expanded-title"
              style={{
                position: "absolute",
                top: "clamp(1.5rem, 5vh, 4rem)",
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
                pointerEvents: "none",
                zIndex: 8,
                whiteSpace: "nowrap",
                opacity: 0,
                transition: "opacity 0.25s ease-out",
                width: "90%",
                maxWidth: "1200px",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(2.2rem, 5.5vw, 5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  textShadow:
                    "0 4px 30px rgba(0, 0, 0, 0.95), 0 2px 10px rgba(0, 0, 0, 0.85)",
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  margin: 0,
                }}
              >
                RVR &amp; JC <span style={{ color: "#FACC15" }}>CAMPUS</span>
              </h2>
              <p
                style={{
                  fontSize: "clamp(0.72rem, 1.1vw, 1.05rem)",
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.9)",
                  margin: "0.5rem 0 0 0",
                  textShadow: "0 2px 12px rgba(0, 0, 0, 0.95)",
                }}
              >
                R.V.R. &amp; J.C. College of Engineering &bull; Guntur, AP
              </p>
            </div>

            {/* Subtle Vignette Gradients */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "140px",
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 3,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "140px",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 3,
              }}
            />

            {/* Audio Mute / Unmute Control Button */}
            <div
              style={{
                position: "absolute",
                bottom: "clamp(1rem, 2.5vw, 2rem)",
                right: "clamp(1rem, 2.5vw, 2.5rem)",
                zIndex: 12,
              }}
            >
              <button
                type="button"
                onClick={toggleSound}
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.55rem 1rem",
                  borderRadius: "9999px",
                  background: "rgba(7, 8, 11, 0.65)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  backdropFilter: "blur(12px)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(7, 8, 11, 0.85)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(7, 8, 11, 0.65)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.22)";
                }}
              >
                {isMuted ? (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                    <span>Unmute</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <span>Sound On</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Playback Indicator */}
            <div
              style={{
                position: "absolute",
                bottom: "clamp(1rem, 2.5vw, 2rem)",
                left: "clamp(1rem, 2.5vw, 2.5rem)",
                zIndex: 12,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "9999px",
                  background: "rgba(0, 0, 0, 0.55)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: isPlaying ? "#22c55e" : "#eab308",
                    boxShadow: isPlaying ? "0 0 8px #22c55e" : "0 0 8px #eab308",
                  }}
                />
                <span>{isPlaying ? "Live Campus Footage" : "Paused"}</span>
              </div>
            </div>

            {/* Outer SVG Border Contour (Morphs smoothly along with SVG clipPath) */}
            <svg
              ref={borderSvgRef}
              className="video-reveal-border"
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 6,
                transition: "opacity 0.2s ease-out",
              }}
            >
              <path
                ref={borderPathRef}
                id="video-flag-border-path"
                d={PATH_FLAG}
                fill="none"
                stroke="rgba(255, 255, 255, 0.28)"
                strokeWidth="0.0025"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
