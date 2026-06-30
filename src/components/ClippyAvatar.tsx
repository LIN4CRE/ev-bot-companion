import React from "react";
import { ClippySkin, CompanionId, CompanionAccessory } from "../types";

interface ClippyAvatarProps {
  skin: ClippySkin;
  expression: "idle" | "listening" | "thinking" | "happy" | "talking";
  character?: CompanionId;
  accessory?: CompanionAccessory;
}

export default function ClippyAvatar({
  skin,
  expression,
  character = "fox",
  accessory = "none"
}: ClippyAvatarProps) {
  // Define skin color palettes mapped to Hex codes for CSS variables
  const getSkinColors = () => {
    switch (skin) {
      case "matrix":
        return {
          glow: "rgba(16, 185, 129, 0.45)",
          primary: "#10b981",
          secondary: "#047857",
          eyes: "#059669",
          pupil: "#022c22",
          accentClass: "text-emerald-400",
          particleClass: "bg-emerald-500",
        };
      case "cyber":
        return {
          glow: "rgba(236, 72, 153, 0.45)",
          primary: "#ec4899",
          secondary: "#a21caf",
          eyes: "#ec4899",
          pupil: "#fdf2f8",
          accentClass: "text-pink-400",
          particleClass: "bg-pink-500",
        };
      case "classic":
        return {
          glow: "rgba(148, 163, 184, 0.15)",
          primary: "#94a3b8",
          secondary: "#475569",
          eyes: "#f8fafc",
          pupil: "#0f172a",
          accentClass: "text-slate-400",
          particleClass: "bg-slate-400",
        };
      case "alert":
        return {
          glow: "rgba(239, 68, 68, 0.45)",
          primary: "#ef4444",
          secondary: "#b91c1c",
          eyes: "#fef2f2",
          pupil: "#991b1b",
          accentClass: "text-red-400",
          particleClass: "bg-red-500",
        };
      case "hologram":
      default:
        return {
          glow: "rgba(56, 189, 248, 0.45)",
          primary: "#38bdf8",
          secondary: "#4f46e5",
          eyes: "#0ea5e9",
          pupil: "#0f172a",
          accentClass: "text-sky-400",
          particleClass: "bg-sky-400",
        };
    }
  };

  const colors = getSkinColors();

  // Dynamic values based on expression for eye tracking, eyebrows & mouth opening
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;
  let eyebrowRotationL = 0;
  let eyebrowRotationR = 0;
  let eyebrowY = 0;
  let mouthOpen = false;

  switch (expression) {
    case "thinking":
      pupilOffsetX = -3;
      pupilOffsetY = -1.5;
      eyebrowRotationL = -15;
      eyebrowRotationR = 10;
      eyebrowY = -1;
      break;
    case "listening":
      pupilOffsetX = 0;
      pupilOffsetY = 2;
      eyebrowRotationL = 5;
      eyebrowRotationR = -5;
      eyebrowY = -3;
      break;
    case "happy":
      pupilOffsetX = 0;
      pupilOffsetY = -3;
      eyebrowRotationL = 15;
      eyebrowRotationR = -15;
      eyebrowY = -4;
      mouthOpen = true;
      break;
    case "talking":
      pupilOffsetX = 1;
      pupilOffsetY = 0.5;
      eyebrowRotationL = 5;
      eyebrowRotationR = -5;
      eyebrowY = -2;
      mouthOpen = true;
      break;
    case "idle":
    default:
      pupilOffsetX = 0;
      pupilOffsetY = 0;
      eyebrowRotationL = 0;
      eyebrowRotationR = 0;
      eyebrowY = 0;
      break;
  }

  // Helper Parametric Parts to render inside the SVG templates
  const renderEyes = (cx1: number, cx2: number, cy: number, r = 9) => {
    return (
      <g className="aura-eyes">
        <ellipse className="aura-eye" cx={cx1} cy={cy} rx={r} ry={r} fill="#1b1f2e" style={{ transformOrigin: `${cx1}px ${cy}px` }} />
        <ellipse className="aura-eye" cx={cx2} cy={cy} rx={r} ry={r} fill="#1b1f2e" style={{ transformOrigin: `${cx2}px ${cy}px` }} />
        <circle 
          className="aura-pupil transition-all duration-150" 
          cx={cx1 - 2} 
          cy={cy - 2.5} 
          r={Math.max(2, r * 0.3)} 
          fill="#fff" 
          opacity="0.95"
          style={{ transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)` }}
        />
        <circle 
          className="aura-pupil transition-all duration-150" 
          cx={cx2 - 2} 
          cy={cy - 2.5} 
          r={Math.max(2, r * 0.3)} 
          fill="#fff" 
          opacity="0.95"
          style={{ transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)` }}
        />
      </g>
    );
  };

  const renderMouth = (defaultD: string, openD: string, strokeWidth = 3.2, strokeColor = "#1b1f2e") => {
    const activePath = mouthOpen 
      ? openD 
      : (expression === "thinking" ? `M 120 162 L 140 162` : defaultD);

    return (
      <path 
        className={`aura-mouth transition-all duration-150 ${mouthOpen ? 'animate-pulse' : ''}`} 
        d={activePath} 
        fill={mouthOpen ? strokeColor : "none"} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
      />
    );
  };

  const renderEyebrows = (yOffset = 0) => {
    return (
      <g className="aura-eyebrows">
        {/* Left Eyebrow */}
        <path
          d="M -9 -1 Q 0 -4 9 -1"
          fill="none"
          stroke="#1b1f2e"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="transition-all duration-200"
          style={{
            transform: `translate(112px, ${114 + eyebrowY + yOffset}px) rotate(${eyebrowRotationL}deg)`,
            transformOrigin: "center"
          }}
        />
        {/* Right Eyebrow */}
        <path
          d="M -9 -1 Q 0 -4 9 -1"
          fill="none"
          stroke="#1b1f2e"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="transition-all duration-200"
          style={{
            transform: `translate(148px, ${114 + eyebrowY + yOffset}px) rotate(${eyebrowRotationR}deg)`,
            transformOrigin: "center"
          }}
        />
      </g>
    );
  };

  // Render accessories positioned inside 260 x 230 space
  const renderAccessory = () => {
    switch (accessory) {
      case "glasses":
        return (
          <g className="aura-accessory" opacity="0.95" id="glasses-acc">
            <circle cx="112" cy="128" r="16" fill="none" stroke="#1b1f2e" strokeWidth="3" />
            <circle cx="148" cy="128" r="16" fill="none" stroke="#1b1f2e" strokeWidth="3" />
            <line x1="128" y1="128" x2="132" y2="128" stroke="#1b1f2e" strokeWidth="3" />
          </g>
        );
      case "hat":
        return (
          <g className="aura-accessory" id="hat-acc" style={{ transformOrigin: "130px 86px" }}>
            <ellipse cx="130" cy="86" rx="52" ry="10" fill="#2b3050" />
            <path d="M100 86 Q100 48 130 48 Q160 48 160 86 Z" fill="#3a4170" />
            <rect x="100" y="77" width="60" height="8" fill="var(--accent2)" />
          </g>
        );
      case "bowtie":
        return (
          <g className="aura-accessory" id="bowtie-acc">
            <path d="M112 182 L130 188 L112 194 Z" fill="var(--accent2)" />
            <path d="M148 182 L130 188 L148 194 Z" fill="var(--accent2)" />
            <circle cx="130" cy="188" r="4.5" fill="#fff" />
          </g>
        );
      case "headphones":
        return (
          <g className="aura-accessory" id="headphones-acc">
            <path d="M84 124 Q84 76 130 76 Q176 76 176 124" fill="none" stroke="#2b3050" strokeWidth="6" />
            <rect x="76" y="118" width="14" height="26" rx="6" fill="var(--accent2)" />
            <rect x="170" y="118" width="14" height="26" rx="6" fill="var(--accent2)" />
          </g>
        );
      case "crown":
        return (
          <g className="aura-accessory" id="crown-acc">
            <path d="M104 84 L112 64 L122 80 L130 58 L138 80 L148 64 L156 84 Z" fill="#ffd66b" stroke="#e0a93a" strokeWidth="1.5" />
            <circle cx="130" cy="70" r="3" fill="#ff7eb6" />
          </g>
        );
      case "none":
      default:
        return null;
    }
  };

  // Render character specific body & templates
  const renderCharacterContent = () => {
    switch (character) {
      case "cat":
        return (
          <>
            <g className="aura-appendage aura-tail" style={{ transformOrigin: "70px 160px" }}>
              <path d="M72 158 Q34 168 40 120 Q48 150 72 146 Z" fill="var(--accent)" />
            </g>
            <g className="aura-body" style={{ transformOrigin: "130px 140px" }}>
              <ellipse cx="130" cy="150" rx="56" ry="50" fill="var(--accent)" />
              <path d="M88 100 L78 60 L116 92 Z" fill="var(--accent)" />
              <path d="M172 100 L182 60 L144 92 Z" fill="var(--accent)" />
              <path d="M93 95 L88 72 L108 92 Z" fill="var(--accent2)" />
              <path d="M167 95 L172 72 L152 92 Z" fill="var(--accent2)" />
              {renderEyes(112, 148, 132, 10)}
              {renderEyebrows(5)}
              <ellipse cx="130" cy="150" rx="5" ry="4" fill="#1b1f2e" />
              {renderMouth('M118 160 Q124 166 130 160 Q136 166 142 160', 'M118 160 Q130 176 142 160 Z')}
              <g stroke="#1b1f2e" strokeWidth="1.6" opacity="0.7">
                <line x1="96" y1="150" x2="70" y2="146" />
                <line x1="96" y1="156" x2="70" y2="158" />
                <line x1="164" y1="150" x2="190" y2="146" />
                <line x1="164" y1="156" x2="190" y2="158" />
              </g>
            </g>
          </>
        );

      case "owl":
        return (
          <g className="aura-body" style={{ transformOrigin: "130px 140px" }}>
            <ellipse cx="130" cy="150" rx="60" ry="56" fill="var(--accent)" />
            <g className="aura-appendage aura-wing" style={{ transformOrigin: "78px 150px" }}>
              <ellipse cx="82" cy="155" rx="20" ry="40" fill="var(--accent2)" />
            </g>
            <g className="aura-appendage aura-wing" style={{ transformOrigin: "182px 150px" }}>
              <ellipse cx="178" cy="155" rx="20" ry="40" fill="var(--accent2)" />
            </g>
            <path d="M88 96 L96 70 L116 92 Z" fill="var(--accent)" />
            <path d="M172 96 L164 70 L144 92 Z" fill="var(--accent)" />
            <circle cx="112" cy="128" r="22" fill="#fff" />
            <circle cx="148" cy="128" r="22" fill="#fff" />
            {renderEyes(112, 148, 128, 11)}
            {renderEyebrows(0)}
            <path d="M124 142 L130 156 L136 142 Z" fill="#ffb24a" />
            {renderMouth('M120 168 Q130 174 140 168', 'M120 168 Q130 182 140 168 Z')}
          </g>
        );

      case "robot":
        return (
          <g className="aura-body" style={{ transformOrigin: "130px 140px" }}>
            <line x1="130" y1="92" x2="130" y2="66" stroke="var(--accent2)" strokeWidth="4" />
            <circle className="aura-spark animate-pulse" cx="130" cy="60" r="7" fill="var(--accent2)" />
            <rect x="78" y="92" width="104" height="92" rx="24" fill="var(--accent)" />
            <rect x="92" y="108" width="76" height="56" rx="16" fill="#10131f" />
            {renderEyes(112, 148, 134, 9)}
            {renderEyebrows(4)}
            {renderMouth('M118 156 Q130 164 142 156', 'M118 156 Q130 172 142 156 Z', 3.2, "var(--accent)")}
            <rect x="60" y="118" width="14" height="40" rx="7" fill="var(--accent2)" />
            <rect x="186" y="118" width="14" height="40" rx="7" fill="var(--accent2)" />
            <rect x="104" y="184" width="16" height="18" rx="6" fill="var(--accent2)" />
            <rect x="140" y="184" width="16" height="18" rx="6" fill="var(--accent2)" />
          </g>
        );

      case "orb":
        return (
          <g className="aura-body" style={{ transformOrigin: "130px 130px" }}>
            <circle className="aura-glow" cx="130" cy="130" r="58" fill="var(--accent)" opacity="0.25" />
            <circle cx="130" cy="130" r="46" fill="var(--accent)" />
            <circle cx="130" cy="130" r="46" fill="url(#orbGrad)" />
            <ellipse className="aura-appendage" cx="130" cy="130" rx="62" ry="20" fill="none" stroke="var(--accent2)" strokeWidth="3" opacity="0.7" style={{ transformOrigin: "130px 130px" }} />
            {renderEyes(116, 144, 126, 8)}
            {renderMouth('M118 148 Q130 156 142 148', 'M118 148 Q130 162 142 148 Z')}
          </g>
        );

      case "ghost":
        return (
          <g className="aura-body aura-float-strong" style={{ transformOrigin: "130px 130px" }}>
            <path d="M82 138 Q82 84 130 84 Q178 84 178 138 L178 186 Q170 174 162 186 Q154 174 146 186 Q138 174 130 186 Q122 174 114 186 Q106 174 98 186 Q90 174 82 186 Z" fill="var(--accent)" opacity="0.95" />
            {renderEyes(114, 146, 124, 9)}
            {renderEyebrows(-4)}
            {renderMouth('M120 146 Q130 156 140 146', 'M120 146 Q130 160 140 146 Z')}
            <circle cx="100" cy="148" r="7" fill="#ff9bbf" opacity="0.4" />
            <circle cx="160" cy="148" r="7" fill="#ff9bbf" opacity="0.4" />
          </g>
        );

      case "plant":
        return (
          <g className="aura-body" style={{ transformOrigin: "130px 160px" }}>
            <path d="M104 196 L116 150 L144 150 L156 196 Z" fill="#c97b4a" />
            <path d="M104 196 L116 150 L144 150 L156 196 Z" fill="#000" opacity="0.06" />
            <ellipse cx="130" cy="150" rx="34" ry="10" fill="#8a5a3a" />
            <g className="aura-appendage" style={{ transformOrigin: "130px 150px" }}>
              <path d="M130 150 Q92 132 96 96 Q126 110 130 150 Z" fill="var(--accent)" />
              <path d="M130 150 Q168 132 164 96 Q134 110 130 150 Z" fill="var(--accent)" />
              <path d="M130 150 Q120 100 130 72 Q140 100 130 150 Z" fill="var(--accent2)" />
            </g>
            {renderEyes(120, 140, 134, 6)}
            {renderMouth('M124 144 Q130 150 136 144', 'M124 144 Q130 154 136 144 Z')}
          </g>
        );

      case "drone":
        return (
          <g className="aura-body aura-float-strong" style={{ transformOrigin: "130px 130px" }}>
            <g className="aura-appendage aura-wing" style={{ transformOrigin: "80px 110px" }}>
              <ellipse cx="74" cy="110" rx="26" ry="6" fill="var(--accent2)" opacity="0.8" />
            </g>
            <g className="aura-appendage aura-wing" style={{ transformOrigin: "180px 110px" }}>
              <ellipse cx="186" cy="110" rx="26" ry="6" fill="var(--accent2)" opacity="0.8" />
            </g>
            <rect x="86" y="104" width="88" height="68" rx="30" fill="var(--accent)" />
            <rect x="98" y="118" width="64" height="40" rx="20" fill="#10131f" />
            {renderEyes(116, 144, 138, 8)}
            {renderMouth('M120 152 Q130 158 140 152', 'M120 152 Q130 164 140 152 Z', 3.2, "var(--accent)")}
            <circle className="aura-spark animate-pulse" cx="130" cy="184" r="5" fill="var(--accent2)" />
          </g>
        );

      case "fox":
      default:
        return (
          <>
            <g className="aura-appendage aura-tail" style={{ transformOrigin: "60px 150px" }}>
              <path d="M62 150 Q20 150 22 110 Q40 130 62 132 Z" fill="var(--accent)" />
              <path d="M40 122 Q26 118 26 112 Q34 120 44 120 Z" fill="#fff" opacity="0.85" />
            </g>
            <g className="aura-body" style={{ transformOrigin: "130px 135px" }}>
              <ellipse cx="130" cy="150" rx="58" ry="48" fill="var(--accent)" />
              <ellipse cx="130" cy="162" rx="34" ry="28" fill="#fff" opacity="0.92" />
              <path d="M86 96 L74 56 L112 86 Z" fill="var(--accent)" />
              <path d="M174 96 L186 56 L148 86 Z" fill="var(--accent)" />
              <path d="M92 92 L86 70 L106 88 Z" fill="var(--accent2)" />
              <path d="M168 92 L174 70 L154 88 Z" fill="var(--accent2)" />
              {renderEyes(112, 148, 128)}
              {renderEyebrows(0)}
              <ellipse cx="130" cy="150" rx="6" ry="5" fill="#1b1f2e" />
              {renderMouth('M118 160 Q130 170 142 160', 'M118 160 Q130 176 142 160 Z')}
            </g>
          </>
        );
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full select-none" id="evbot-container">
      {/* 60FPS CSS animation overrides injected cleanly for all vectors */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes aura-breath {
          0%, 100% { transform: scale(1) translateY(0px); }
          50% { transform: scale(1.03, 0.97) translateY(1.5px); }
        }
        @keyframes aura-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(1.5deg); }
        }
        @keyframes aura-wag {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes aura-wag-reverse {
          0%, 100% { transform: rotate(5deg); }
          50% { transform: rotate(-5deg); }
        }
        @keyframes aura-blink {
          0%, 93%, 97%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .aura-body {
          animation: aura-breath 3.2s ease-in-out infinite;
        }
        .aura-float-strong {
          animation: aura-float 4.2s ease-in-out infinite;
        }
        .aura-appendage.aura-tail {
          animation: aura-wag 2.2s ease-in-out infinite;
        }
        .aura-appendage.aura-wing {
          animation: aura-wag-reverse 2s ease-in-out infinite;
        }
        .aura-eye {
          animation: aura-blink 4.5s ease-in-out infinite;
        }
      `}} />

      {/* Background Holographic Rings & Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Soft Aura Glow */}
        <div 
          className="absolute w-44 h-44 rounded-full blur-2xl opacity-20 transition-all duration-700"
          style={{ backgroundColor: colors.glow }}
        />
        {/* Animated Holographic Rings */}
        {skin !== "classic" && (
          <>
            <div 
              className="absolute w-48 h-48 rounded-full border border-dashed opacity-10 animate-[spin_40s_linear_infinite]"
              style={{ borderColor: colors.primary }}
            />
            <div 
              className="absolute w-36 h-36 rounded-full border border-dotted opacity-20 animate-[spin_20s_linear_infinite_reverse]"
              style={{ borderColor: colors.primary }}
            />
          </>
        )}

        {/* Dynamic Float particles */}
        <div className={`absolute w-1.5 h-1.5 rounded-full ${colors.particleClass} opacity-60 animate-bounce top-8 left-12`} />
        <div className={`absolute w-2 h-2 rounded-full ${colors.particleClass} opacity-40 animate-float bottom-10 right-8`} />
        <div className={`absolute w-1 h-1 rounded-full ${colors.particleClass} opacity-80 animate-ping top-20 right-14`} />
      </div>

      {/* Main Vector Canvas */}
      <svg
        id="evbot-vector"
        viewBox="0 0 260 230"
        className="w-40 h-52 filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] z-10 transition-transform duration-300"
        style={{
          filter: `drop-shadow(0 0 12px ${colors.glow})`,
          // Bind the skin accent variables so they are available inside the SVG
          // @ts-ignore
          "--accent": colors.primary,
          "--accent2": colors.secondary
        }}
      >
        <defs>
          <radialGradient id="orbGrad" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.55} />
            <stop offset="55%" stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* EV-Bot Holographic Projection Base Beams */}
        {skin !== "classic" && (
          <path
            d="M 65 210 L 130 130 L 195 210 Z"
            fill={
              skin === "hologram" ? "rgba(56, 189, 248, 0.08)" : 
              skin === "matrix" ? "rgba(16, 185, 129, 0.08)" : 
              skin === "cyber" ? "rgba(236, 72, 153, 0.08)" : 
              skin === "alert" ? "rgba(239, 68, 68, 0.08)" : 
              "rgba(255, 255, 255, 0.05)"
            }
            className="animate-pulse"
          />
        )}

        {/* Main Character Body / Template */}
        {renderCharacterContent()}

        {/* Selected accessory overlays */}
        {renderAccessory()}
      </svg>
    </div>
  );
}
