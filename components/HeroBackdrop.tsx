/**
 * Animated copper → sage → earth gradient with drifting glows and floating
 * sparkles (keyframes in globals.css). Fills its positioned parent; used by
 * PageHero and the call-to-action banners so they look the same.
 */
export default function HeroBackdrop() {
  return (
    <>
      <div className="hero-gradient absolute inset-0 bg-gradient-to-br from-[#3E2723] via-[#5f8579] to-[#A0522D]" />
      <div className="hero-glow-a absolute top-0 left-1/3 w-96 h-96 rounded-full bg-[#A0522D]/30 blur-[120px]" />
      <div className="hero-glow-b absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-[#2b1b16]/40 blur-[100px]" />
      <div className="hero-glow-c absolute top-[calc(50%-300px)] left-[calc(50%-300px)] w-[600px] h-[600px] rounded-full bg-[#e2b078]/15 blur-[150px]" />
      <div className="hero-sheen absolute inset-0" />

      <div className="hero-dot absolute top-[22%] right-[12%] w-3 h-3 rounded-full bg-white/30" />
      <div className="hero-dot hero-dot-2 absolute bottom-[18%] left-[8%] w-2 h-2 rounded-full bg-white/25" />
      <div className="hero-dot hero-dot-3 absolute top-1/3 right-[6%] w-2 h-2 rounded-full bg-white/25" />
      <div className="hero-dot hero-dot-4 absolute top-[38%] left-[16%] w-1.5 h-1.5 rounded-full bg-[#f3d2a8]/40" />
      <div className="hero-dot hero-dot-5 absolute bottom-[30%] right-[22%] w-1.5 h-1.5 rounded-full bg-white/30" />
    </>
  );
}
