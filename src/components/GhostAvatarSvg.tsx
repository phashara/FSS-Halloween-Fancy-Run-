import React from 'react';
import { GhostSpeciesId } from '../types';

interface Props {
  speciesId: GhostSpeciesId;
  className?: string;
  scaryLevel?: number; // 1 to 3
}

export const GhostAvatarSvg: React.FC<Props> = ({ speciesId, className = 'w-32 h-32', scaryLevel = 3 }) => {
  switch (speciesId) {
    case 'krasue':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="krasueAura" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#15803d" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#450a0a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="50%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#052e16" />
            </radialGradient>
            <linearGradient id="rottingIntestines" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="25%" stopColor="#ef4444" />
              <stop offset="60%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <filter id="horrorBlur">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>

          {/* Sinister Blood & Green Ghost Aura */}
          <circle cx="110" cy="80" r="90" fill="url(#krasueAura)" />

          {/* Floating Ghost Wisps */}
          <circle cx="45" cy="180" r="8" fill="#22c55e" opacity="0.6" className="animate-pulse" />
          <circle cx="175" cy="200" r="10" fill="#ef4444" opacity="0.5" className="animate-ping" />
          <circle cx="55" cy="220" r="5" fill="#f87171" opacity="0.7" />

          {/* Disheveled Wild Tangled Dark Hair */}
          <path
            d="M30 70 C15 -10 205 -10 190 70 C215 130 195 170 170 150 C185 100 170 40 110 40 C50 40 35 100 50 150 C25 170 5 130 30 70 Z"
            fill="#09090b"
          />
          {/* Stray Strands of Hair */}
          <path d="M40 90 Q20 140 10 190 Q30 160 50 130" stroke="#18181b" strokeWidth="3" fill="none" />
          <path d="M180 90 Q200 140 210 190 Q190 160 170 130" stroke="#18181b" strokeWidth="3" fill="none" />

          {/* Decaying Corpse Pale Head */}
          <ellipse cx="110" cy="85" rx="38" ry="46" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
          {/* Sunken eye sockets & dark hollow shadows */}
          <ellipse cx="94" cy="78" rx="14" ry="12" fill="#0f172a" />
          <ellipse cx="126" cy="78" rx="14" ry="12" fill="#0f172a" />
          {/* Veins on temple */}
          <path d="M80 65 Q75 55 65 60" stroke="#047857" strokeWidth="1.5" fill="none" opacity="0.8" />
          <path d="M140 65 Q145 55 155 60" stroke="#991b1b" strokeWidth="1.5" fill="none" opacity="0.8" />

          {/* Piercing Glowing Emerald Demon Eyes with Slit Pupils */}
          <ellipse cx="94" cy="78" rx="7" ry="9" fill="url(#eyeGlow)" />
          <ellipse cx="126" cy="78" rx="7" ry="9" fill="url(#eyeGlow)" />
          <line x1="94" y1="72" x2="94" y2="84" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="126" y1="72" x2="126" y2="84" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" />
          {/* Blood tears dripping from eyes */}
          <path d="M94 88 Q92 105 90 115" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M126 88 Q128 105 130 118" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />

          {/* Gaping Carnivorous Mouth with Sharp Vampire Fangs */}
          <path d="M90 108 Q110 126 130 108 Q110 134 90 108 Z" fill="#450a0a" stroke="#7f1d1d" strokeWidth="2" />
          {/* Sharp Fangs dripping blood */}
          <polygon points="96,109 100,119 103,109" fill="#f8fafc" />
          <polygon points="117,109 120,119 124,109" fill="#f8fafc" />
          <polygon points="102,126 105,116 108,126" fill="#f8fafc" />
          <polygon points="112,126 115,116 118,126" fill="#f8fafc" />
          {/* Blood dripping from chin */}
          <path d="M110 128 L110 142" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
          <path d="M100 124 L98 136" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" />

          {/* Severed Neck with Raw Flesh, Trachea & Arteries */}
          <ellipse cx="110" cy="132" rx="20" ry="8" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
          <ellipse cx="110" cy="132" rx="8" ry="4" fill="#1e1b4b" />

          {/* Pulsating Necrotic Heart & Trailing Entrails (Stomach, Liver, Intestines) */}
          {/* Heart / Stomach */}
          <ellipse cx="110" cy="155" rx="16" ry="14" fill="#991b1b" stroke="#f87171" strokeWidth="2" />
          {/* Winding, twisted intestines */}
          <path
            d="M102 140 C85 160 135 170 100 195 C75 215 130 225 105 255"
            stroke="url(#rottingIntestines)"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M116 142 C135 165 95 180 120 205 C135 225 90 235 112 258"
            stroke="url(#rottingIntestines)"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          {/* Glowing Veins on Entrails */}
          <path d="M102 170 Q115 185 108 200" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.8" />
          {/* Dripping Blood Drops */}
          <circle cx="105" cy="258" r="3.5" fill="#dc2626" />
          <circle cx="95" cy="225" r="2.5" fill="#991b1b" />
          <circle cx="125" cy="210" r="3" fill="#ef4444" />
        </svg>
      );

    case 'krahang':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="krahangAura" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#dc2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#090514" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="90" r="95" fill="url(#krahangAura)" />

          {/* Menacing Dark Spiked Winnowing Baskets (กระด้งมรณะ) */}
          <g transform="rotate(-20 35 120)">
            <ellipse cx="35" cy="120" rx="34" ry="52" fill="#271306" stroke="#b45309" strokeWidth="4" />
            <ellipse cx="35" cy="120" rx="26" ry="42" fill="#1c1917" stroke="#78350f" strokeWidth="2" strokeDasharray="4 4" />
            {/* Spikes / Claws on Baskets */}
            <polygon points="5,100 0,90 10,95" fill="#f59e0b" />
            <polygon points="2,120 -5,120 4,125" fill="#f59e0b" />
            <polygon points="5,140 0,150 10,145" fill="#f59e0b" />
          </g>

          <g transform="rotate(20 185 120)">
            <ellipse cx="185" cy="120" rx="34" ry="52" fill="#271306" stroke="#b45309" strokeWidth="4" />
            <ellipse cx="185" cy="120" rx="26" ry="42" fill="#1c1917" stroke="#78350f" strokeWidth="2" strokeDasharray="4 4" />
            {/* Spikes */}
            <polygon points="215,100 220,90 210,95" fill="#f59e0b" />
            <polygon points="218,120 225,120 216,125" fill="#f59e0b" />
            <polygon points="215,140 220,150 210,145" fill="#f59e0b" />
          </g>

          {/* Dark Muscular Cursed Torso */}
          <path d="M85 85 Q110 75 135 85 L142 160 Q110 172 78 160 Z" fill="#581c87" stroke="#7e22ce" strokeWidth="2" />
          {/* Cursed Occult Yantra Runes (รอยสักยันต์มนต์ดำ) */}
          <path d="M110 95 L110 145 M95 115 L125 115 M100 130 L120 130" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          <circle cx="110" cy="115" r="8" stroke="#f59e0b" strokeWidth="1.5" fill="none" />

          {/* Tattered Red Demon Chongkraben */}
          <path d="M78 160 Q110 190 142 160 L130 210 Q110 225 90 210 Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />

          {/* Menacing Demonic Head */}
          <circle cx="110" cy="55" r="30" fill="#3b0764" stroke="#6b21a8" strokeWidth="2" />
          {/* Bloodied Headband */}
          <rect x="80" y="42" width="60" height="10" rx="4" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />
          {/* Occult Forehead Rune */}
          <circle cx="110" cy="47" r="3" fill="#f59e0b" />

          {/* Piercing Fiery Blood-Red Eyes */}
          <ellipse cx="98" cy="56" rx="6" ry="7" fill="#ef4444" />
          <ellipse cx="122" cy="56" rx="6" ry="7" fill="#ef4444" />
          <circle cx="98" cy="56" r="2.5" fill="#fef08a" />
          <circle cx="122" cy="56" r="2.5" fill="#fef08a" />

          {/* Snarling Wicked Mouth with Sharp Fangs */}
          <path d="M96 72 Q110 82 124 72 Z" fill="#18181b" stroke="#991b1b" strokeWidth="2" />
          <polygon points="102,72 105,79 108,72" fill="#ffffff" />
          <polygon points="112,72 115,79 118,72" fill="#ffffff" />

          {/* Heavy Stone Pestle Mortar Stick bound with chains */}
          <rect x="103" y="165" width="14" height="85" rx="7" fill="#1c1917" stroke="#dc2626" strokeWidth="3" transform="rotate(6 110 205)" />
          {/* Spikes on pestle */}
          <line x1="98" y1="210" x2="126" y2="210" stroke="#f59e0b" strokeWidth="3" />
          <line x1="99" y1="230" x2="127" y2="230" stroke="#f59e0b" strokeWidth="3" />
        </svg>
      );

    case 'pop':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="popGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#991b1b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#450a0a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="130" r="95" fill="url(#popGlow)" />

          {/* Ancient Cracked Earthen Dragon Jar (โอ่งมังกรสยอง) */}
          <ellipse cx="110" cy="180" rx="75" ry="52" fill="#1c1917" stroke="#78350f" strokeWidth="6" />
          <ellipse cx="110" cy="138" rx="55" ry="16" fill="#292524" stroke="#d97706" strokeWidth="4" />
          {/* Cracks in Jar glowing blood red */}
          <path d="M85 155 L75 190 L90 215" stroke="#ef4444" strokeWidth="2.5" fill="none" />
          <path d="M140 160 L150 195 L135 220" stroke="#ef4444" strokeWidth="2" fill="none" />

          {/* Screaming Tormented Souls inside the Jar */}
          <ellipse cx="90" cy="165" rx="10" ry="13" fill="#dc2626" opacity="0.8" className="animate-pulse" />
          <ellipse cx="130" cy="165" rx="10" ry="13" fill="#dc2626" opacity="0.8" className="animate-pulse" />
          <circle cx="90" cy="165" r="4" fill="#fef08a" />
          <circle cx="130" cy="165" r="4" fill="#fef08a" />

          {/* Bloodcurdling Pop Ghoul Head Crouching & Peering Out */}
          <circle cx="110" cy="85" r="44" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          {/* Tangled Messy Hag Hair */}
          <path d="M60 85 C55 30 165 30 160 85 C165 50 140 30 110 30 C80 30 55 50 60 85 Z" fill="#0f172a" />
          <path d="M65 85 L50 130" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
          <path d="M155 85 L170 130" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />

          {/* Sunken Hollow Bleeding Eyes */}
          <ellipse cx="92" cy="80" rx="12" ry="14" fill="#020617" />
          <ellipse cx="128" cy="80" rx="12" ry="14" fill="#020617" />
          <circle cx="92" cy="78" r="4" fill="#ef4444" />
          <circle cx="128" cy="78" r="4" fill="#ef4444" />
          {/* Blood streaming from eyes */}
          <path d="M92 92 L90 120" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />
          <path d="M128 92 L130 120" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />

          {/* Gaping Monstrous Maw devouring raw flesh */}
          <path d="M88 102 Q110 132 132 102 Z" fill="#450a0a" stroke="#991b1b" strokeWidth="3" />
          {/* Razor needle fangs */}
          <polygon points="94,103 98,114 102,103" fill="#ffffff" />
          <polygon points="106,103 110,117 114,103" fill="#ffffff" />
          <polygon points="118,103 122,114 126,103" fill="#ffffff" />
          <polygon points="100,122 104,112 108,122" fill="#ffffff" />
          <polygon points="112,122 116,112 120,122" fill="#ffffff" />
          {/* Blood dripping from raw meat in mouth */}
          <path d="M110 116 Q105 138 100 150" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />

          {/* Razor-sharp Black Claws clutching the jar rim */}
          <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round">
            <path d="M68 132 L72 120 L78 132" />
            <path d="M78 132 L82 120 L88 132" />
            <path d="M88 132 L92 120 L98 132" />
            <path d="M122 132 L126 120 L132 132" />
            <path d="M132 132 L136 120 L142 132" />
            <path d="M142 132 L146 120 L152 132" />
          </g>
        </svg>
      );

    case 'tani':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="taniAura" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#15803d" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#064e3b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="100" r="95" fill="url(#taniAura)" />

          {/* Ominous Decaying Banana Fronds in Mist */}
          <path d="M30 180 Q10 80 80 30 Q70 100 85 150 Z" fill="#14532d" stroke="#15803d" strokeWidth="2" />
          <path d="M190 180 Q210 80 140 30 Q150 100 135 150 Z" fill="#14532d" stroke="#15803d" strokeWidth="2" />

          {/* Corpse-pale Greenish Apparition Body */}
          <path d="M90 100 L130 100 L138 220 L82 220 Z" fill="#047857" stroke="#10b981" strokeWidth="2" />
          {/* Shredded Rotting Sabai Fabric */}
          <path d="M90 100 L140 160 L125 220 L80 150 Z" fill="#064e3b" />
          <path d="M120 180 L135 230" stroke="#059669" strokeWidth="3" strokeDasharray="3 3" />

          {/* Ghostly Head & Ancient Chignon with Withered Orchid */}
          <circle cx="110" cy="65" r="32" fill="#d1fae5" stroke="#6ee7b7" strokeWidth="1.5" />
          <circle cx="110" cy="35" r="18" fill="#022c22" />
          <circle cx="128" cy="35" r="6" fill="#84cc16" opacity="0.8" />

          {/* Uncanny Glowing Hollow Greenish-White Eyes */}
          <ellipse cx="98" cy="62" rx="6" ry="8" fill="#064e3b" />
          <ellipse cx="122" cy="62" rx="6" ry="8" fill="#064e3b" />
          <circle cx="98" cy="62" r="3" fill="#ecfdf5" />
          <circle cx="122" cy="62" r="3" fill="#ecfdf5" />
          {/* Black cursed tears */}
          <path d="M98 70 L96 90" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" />
          <path d="M122 70 L124 90" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" />

          {/* Sinister Red Lip Smile with dripping curse */}
          <path d="M102 82 Q110 90 118 82" stroke="#be123c" strokeWidth="3.5" strokeLinecap="round" />

          {/* Bloody Hanging Banana Blossom (หัวปลีหยดเลือด) */}
          <path d="M110 205 Q122 230 110 250 Q98 230 110 205 Z" fill="#881337" stroke="#f43f5e" strokeWidth="2" />
          <circle cx="110" cy="255" r="2.5" fill="#f43f5e" />
        </svg>
      );

    case 'maenak':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="maenakGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#881337" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="90" r="95" fill="url(#maenakGlow)" />

          {/* Sunken Mournful Skeletal Face */}
          <circle cx="105" cy="70" r="36" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
          {/* Tangled Jet Black Hair flowing in storm */}
          <path d="M65 65 C55 10 155 10 145 65 C155 110 140 135 130 125 C115 70 95 70 80 125 C70 135 55 110 65 65 Z" fill="#020617" />
          <path d="M70 95 L50 160" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />

          {/* Pitch Black Void Eyes Streaming Thick Dark Blood Tears */}
          <ellipse cx="94" cy="68" rx="7" ry="10" fill="#020617" />
          <ellipse cx="120" cy="68" rx="7" ry="10" fill="#020617" />
          <circle cx="94" cy="68" r="2" fill="#ef4444" />
          <circle cx="120" cy="68" r="2" fill="#ef4444" />
          {/* Blood streams */}
          <path d="M94 78 Q92 105 88 125" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" />
          <path d="M120 78 Q122 105 126 125" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" />

          {/* Rotting Gaping Sorrowful Maw */}
          <path d="M96 90 Q107 105 118 90" stroke="#881337" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Unnaturally Elongated Skeletal Arm reaching out menacingly */}
          <path
            d="M125 100 Q175 110 195 145 Q210 165 200 175 Q185 170 165 130 Z"
            fill="#e2e8f0"
            stroke="#e11d48"
            strokeWidth="2.5"
          />
          {/* Long Razor Black Fingernails */}
          <line x1="200" y1="172" x2="212" y2="182" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <line x1="195" y1="175" x2="206" y2="188" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <line x1="190" y1="176" x2="198" y2="192" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

          {/* Decaying Traditional Brown Wrap */}
          <path d="M80 105 L130 105 L120 220 L80 220 Z" fill="#451a03" stroke="#78350f" strokeWidth="2" />

          {/* Desiccated Swaddled Baby in Arm with Ghostly Infant Skull */}
          <ellipse cx="85" cy="150" rx="22" ry="30" fill="#9f1239" stroke="#fda4af" strokeWidth="2" />
          <circle cx="85" cy="135" r="10" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
          {/* Baby Skull Eye Sockets */}
          <circle cx="82" cy="134" r="2" fill="#0f172a" />
          <circle cx="88" cy="134" r="2" fill="#0f172a" />
        </svg>
      );

    case 'kuman':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="kumanGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#b91c1c" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="100" r="95" fill="url(#kumanGlow)" />

          {/* Charred Mummified Skin covered in Cracking Gold Leaf */}
          <circle cx="110" cy="75" r="40" fill="#1c1917" stroke="#ca8a04" strokeWidth="3" />
          {/* Peeling Gold Flakes */}
          <path d="M85 60 L92 52 L98 62 Z" fill="#facc15" />
          <path d="M125 60 L132 52 L138 62 Z" fill="#facc15" />
          <path d="M102 95 L110 88 L118 95 Z" fill="#facc15" />

          {/* Topknot with Bone Ribbon */}
          <ellipse cx="110" cy="30" rx="16" ry="20" fill="#09090b" stroke="#ca8a04" strokeWidth="2" />
          <rect x="98" y="36" width="24" height="8" rx="4" fill="#dc2626" />

          {/* Glowing Cursed Red Occult Runes on Forehead */}
          <path d="M110 48 L110 60 M102 54 L118 54" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

          {/* Demonic Crimson Eyes with Soul Flames */}
          <ellipse cx="96" cy="72" rx="7" ry="8" fill="#ef4444" />
          <ellipse cx="124" cy="72" rx="7" ry="8" fill="#ef4444" />
          <circle cx="96" cy="72" r="3" fill="#fef08a" />
          <circle cx="124" cy="72" r="3" fill="#fef08a" />

          {/* Sinister Grinning Jaw with Razor Teeth */}
          <path d="M96 92 Q110 108 124 92 Z" fill="#450a0a" stroke="#b45309" strokeWidth="2.5" />
          <polygon points="102,93 105,100 108,93" fill="#ffffff" />
          <polygon points="112,93 115,100 118,93" fill="#ffffff" />

          {/* Ancient Charred Torso with Occult Yantra */}
          <path d="M85 115 L135 115 L128 190 L92 190 Z" fill="#1c1917" stroke="#b45309" strokeWidth="2" />
          <line x1="110" y1="125" x2="110" y2="175" stroke="#ef4444" strokeWidth="2" />
          <line x1="95" y1="145" x2="125" y2="145" stroke="#ef4444" strokeWidth="2" />

          {/* Ritual Sacrificial Blade in Hand dripping blood */}
          <path d="M138 120 L165 95 L170 105 L145 135 Z" fill="#e2e8f0" stroke="#dc2626" strokeWidth="2" />
          <circle cx="170" cy="95" r="3" fill="#ef4444" />

          {/* Red Soda Bottle offering dripping with blood-red essence */}
          <rect x="52" y="145" width="22" height="48" rx="4" fill="#991b1b" stroke="#f87171" strokeWidth="2" />
          <rect x="59" y="135" width="8" height="10" fill="#f8fafc" />
          <path d="M63 135 L68 115" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'pret':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="pretGlow" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#0f172a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="80" r="95" fill="url(#pretGlow)" />

          {/* Night Storm Clouds & Lightning */}
          <ellipse cx="60" cy="50" rx="35" ry="12" fill="#1e293b" opacity="0.6" />
          <ellipse cx="160" cy="65" rx="40" ry="14" fill="#1e293b" opacity="0.6" />
          <path d="M145 40 L135 60 L142 62 L132 85" stroke="#38bdf8" strokeWidth="2" fill="none" />

          {/* Towering Needle-Mouthed Skeletal Head */}
          <circle cx="110" cy="32" r="16" fill="#155e75" stroke="#22d3ee" strokeWidth="2" />
          {/* Sunken Hollow Eye Sockets with Burning Red Dots */}
          <circle cx="104" cy="28" r="3.5" fill="#020617" />
          <circle cx="116" cy="28" r="3.5" fill="#020617" />
          <circle cx="104" cy="28" r="1.5" fill="#ef4444" />
          <circle cx="116" cy="28" r="1.5" fill="#ef4444" />

          {/* Pinpoint Whistling Needle Mouth emitting sonic agony */}
          <circle cx="110" cy="38" r="2" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
          <path d="M110 40 Q110 48 108 55" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />

          {/* Giant Monstrous Palm Hands as big as Palm Leaves */}
          <path d="M65 40 L30 15 L45 50 L25 65 L60 70 Z" fill="#0e7490" stroke="#67e8f9" strokeWidth="2" />
          <path d="M155 40 L190 15 L175 50 L195 65 L160 70 Z" fill="#0e7490" stroke="#67e8f9" strokeWidth="2" />

          {/* Gaunt Elongated Neck & Exposed Skeletal Ribcage */}
          <rect x="107" y="48" width="6" height="75" fill="#164e63" />
          {/* Ribcage with Soul Flames inside */}
          <rect x="102" y="123" width="16" height="42" fill="#083344" stroke="#06b6d4" strokeWidth="2" />
          <line x1="96" y1="130" x2="124" y2="130" stroke="#22d3ee" strokeWidth="2" />
          <line x1="96" y1="140" x2="124" y2="140" stroke="#22d3ee" strokeWidth="2" />
          <line x1="98" y1="150" x2="122" y2="150" stroke="#22d3ee" strokeWidth="2" />
          <circle cx="110" cy="142" r="3.5" fill="#ef4444" className="animate-ping" />

          {/* Super Long Colossal Legs striding through the darkness */}
          <line x1="105" y1="165" x2="65" y2="255" stroke="#0891b2" strokeWidth="7" strokeLinecap="round" />
          <line x1="115" y1="165" x2="155" y2="255" stroke="#0e7490" strokeWidth="7" strokeLinecap="round" />
        </svg>
      );

    case 'kongkoi':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="kongkoiGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#0f766e" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#134e4a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="100" r="95" fill="url(#kongkoiGlow)" />

          {/* Ferocious Monkey-Faced Forest Ghoul Head */}
          <circle cx="110" cy="70" r="35" fill="#115e59" stroke="#2dd4bf" strokeWidth="2.5" />
          {/* Bat-like Pointed Piercing Ears */}
          <polygon points="72,60 50,40 80,48" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
          <polygon points="148,60 170,40 140,48" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />

          {/* Bloodthirsty Yellow Reptilian Slit Eyes */}
          <circle cx="98" cy="65" r="8" fill="#facc15" />
          <circle cx="122" cy="65" r="8" fill="#facc15" />
          <line x1="98" y1="58" x2="98" y2="72" stroke="#042f2e" strokeWidth="3" strokeLinecap="round" />
          <line x1="122" y1="58" x2="122" y2="72" stroke="#042f2e" strokeWidth="3" strokeLinecap="round" />

          {/* Snarling Screeching Maw with Needle Teeth */}
          <path d="M92 84 Q110 102 128 84 Z" fill="#450a0a" stroke="#991b1b" strokeWidth="2.5" />
          <polygon points="98,85 101,93 104,85" fill="#ffffff" />
          <polygon points="107,85 110,95 113,85" fill="#ffffff" />
          <polygon points="116,85 119,93 122,85" fill="#ffffff" />

          {/* Hairy Hunched Forest Body */}
          <ellipse cx="110" cy="125" rx="32" ry="36" fill="#042f2e" stroke="#0f766e" strokeWidth="2" />

          {/* Twisted Single Springing Muscle Leg */}
          <path d="M110 160 L108 215 L128 235" stroke="#14b8a6" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
          {/* Backward Facing Foot with Curved Blood Talons */}
          <ellipse cx="132" cy="242" rx="20" ry="7" fill="#0d9488" stroke="#2dd4bf" strokeWidth="2" />
          <line x1="145" y1="242" x2="155" y2="246" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
          <line x1="148" y1="238" x2="158" y2="241" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'headless':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="headlessGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#991b1b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="100" r="95" fill="url(#headlessGlow)" />

          {/* Decapitated Muscular Warrior Body in Battle Armor */}
          <rect x="75" y="80" width="60" height="85" rx="10" fill="#7c2d12" stroke="#ea580c" strokeWidth="3" />

          {/* Severed Neck Stump with Bone & Gushing Blood Fountain */}
          <ellipse cx="105" cy="78" rx="20" ry="10" fill="#991b1b" stroke="#f97316" strokeWidth="3" />
          <ellipse cx="105" cy="78" rx="6" ry="3" fill="#f8fafc" />
          {/* Blood Spurts */}
          <path d="M98 75 Q92 50 85 45" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M105 72 Q105 40 108 30" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
          <path d="M112 75 Q118 48 126 42" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />

          {/* Cursed Ancient Battle Blades */}
          <line x1="40" y1="35" x2="65" y2="185" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
          <line x1="38" y1="35" x2="44" y2="55" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />

          {/* Decapitated Head held under the other arm */}
          <circle cx="155" cy="155" r="26" fill="#e2e8f0" stroke="#7c2d12" strokeWidth="2.5" />
          {/* Dead Glazed Eyes */}
          <circle cx="148" cy="150" r="4.5" fill="#64748b" />
          <circle cx="162" cy="150" r="4.5" fill="#64748b" />
          <line x1="144" y1="150" x2="152" y2="150" stroke="#0f172a" strokeWidth="2" />
          <line x1="158" y1="150" x2="166" y2="150" stroke="#0f172a" strokeWidth="2" />
          {/* Open Mouth with Blood Drip */}
          <ellipse cx="155" cy="165" rx="6" ry="4" fill="#450a0a" />
          <path d="M155 168 L155 178" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />

          {/* Powerful Charging Legs */}
          <line x1="88" y1="165" x2="70" y2="250" stroke="#c2410c" strokeWidth="12" strokeLinecap="round" />
          <line x1="122" y1="165" x2="140" y2="240" stroke="#9a3412" strokeWidth="12" strokeLinecap="round" />
        </svg>
      );

    case 'nangram':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="nangramGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#581c87" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="100" r="95" fill="url(#nangramGlow)" />

          {/* Cursed Golden Chada (ชฎาโบราณประดับกะโหลก) */}
          <polygon points="110,10 120,55 100,55" fill="#ca8a04" stroke="#facc15" strokeWidth="2.5" />
          <rect x="94" y="55" width="32" height="12" rx="3" fill="#a16207" stroke="#facc15" strokeWidth="2" />
          {/* Tiny Skull on Chada */}
          <circle cx="110" cy="60" r="3.5" fill="#f8fafc" />

          {/* Cracked White Porcelain Funeral Mask Face */}
          <circle cx="110" cy="85" r="30" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          {/* Porcelain Cracks on Face */}
          <path d="M100 70 L94 85 L98 95" stroke="#334155" strokeWidth="1.5" fill="none" />
          <path d="M125 75 L120 90 L128 102" stroke="#334155" strokeWidth="1.5" fill="none" />

          {/* Pitch-Black Void Eye Sockets Weeping Dark Blood */}
          <ellipse cx="101" cy="82" rx="6" ry="8" fill="#020617" />
          <ellipse cx="119" cy="82" rx="6" ry="8" fill="#020617" />
          <circle cx="101" cy="82" r="1.5" fill="#ef4444" />
          <circle cx="119" cy="82" r="1.5" fill="#ef4444" />
          {/* Blood tears */}
          <path d="M101 90 L100 108" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M119 90 L120 108" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" />

          {/* Blood-Red Classical Lip Smile */}
          <path d="M104 100 Q110 106 116 100" stroke="#9f1239" strokeWidth="3" strokeLinecap="round" />

          {/* Unnaturally Backward Bent Dancing Fingers with Sharp Golden Nails */}
          <path d="M78 115 Q45 125 40 95" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
          {/* Golden Nails */}
          <line x1="40" y1="95" x2="30" y2="78" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
          <line x1="42" y1="92" x2="33" y2="74" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />

          <path d="M142 115 Q175 125 180 95" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
          {/* Golden Nails */}
          <line x1="180" y1="95" x2="190" y2="78" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
          <line x1="178" y1="92" x2="187" y2="74" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />

          {/* Decaying Royal Purple & Gold Costume */}
          <path d="M88 115 L132 115 L140 225 L80 225 Z" fill="#581c87" stroke="#7e22ce" strokeWidth="2" />
          <path d="M88 115 L134 165 L128 225 L80 170 Z" fill="#ca8a04" stroke="#facc15" strokeWidth="1.5" />
        </svg>
      );

    case 'phiphong':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="swampGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#84cc16" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#365314" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="noseLaser" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#facc15" stopOpacity="1" />
              <stop offset="30%" stopColor="#84cc16" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#14532d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="110" cy="110" r="95" fill="url(#swampGlow)" />

          {/* Searchlight Phosphorous Nose Beam shooting down into swamp */}
          <polygon points="110,88 10,255 210,255" fill="url(#noseLaser)" />

          {/* Rotting Swamp Ghoul Head with Moss & Leeches */}
          <circle cx="110" cy="75" r="36" fill="#4d7c0f" stroke="#84cc16" strokeWidth="2.5" />
          {/* Hollow Feral Swamp Eyes */}
          <ellipse cx="96" cy="70" rx="7" ry="9" fill="#14532d" />
          <ellipse cx="124" cy="70" rx="7" ry="9" fill="#14532d" />
          <circle cx="96" cy="70" r="3" fill="#bef264" />
          <circle cx="124" cy="70" r="3" fill="#bef264" />

          {/* Blinding Phosphor Nose Tip (รูจมูกเรืองแสงพราย) */}
          <circle cx="110" cy="88" r="11" fill="#facc15" stroke="#ffffff" strokeWidth="3" className="animate-ping" />
          <circle cx="110" cy="88" r="9" fill="#ffffff" />

          {/* Gaping Carnivorous Maw chewing on swamp prey */}
          <path d="M96 102 Q110 118 124 102 Z" fill="#1c1917" stroke="#dc2626" strokeWidth="2" />
          <polygon points="100,103 103,110 106,103" fill="#ffffff" />
          <polygon points="114,103 117,110 120,103" fill="#ffffff" />

          {/* Tattered Moss Clothes & Frog Catcher Basket */}
          <path d="M88 112 L132 112 L125 190 L95 190 Z" fill="#1e3a10" stroke="#65a30d" strokeWidth="2" />
          <ellipse cx="155" cy="150" rx="16" ry="22" fill="#365314" stroke="#a3e635" strokeWidth="2" />
        </svg>
      );

    case 'phiruen':
      return (
        <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ruenGlow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#082f49" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="100" r="95" fill="url(#ruenGlow)" />

          {/* Abandoned Dilapidated Spirit Shrine Roof with Cracks */}
          <polygon points="110,25 165,68 55,68" fill="#0369a1" stroke="#38bdf8" strokeWidth="3.5" />
          <path d="M100 35 L120 50 L110 65" stroke="#f43f5e" strokeWidth="2" fill="none" />
          <rect x="72" y="68" width="76" height="55" fill="#082f49" stroke="#0284c7" strokeWidth="2" />

          {/* Ancient Masked House Spirit Face Floating within the Shrine */}
          <circle cx="110" cy="98" r="28" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2.5" />
          {/* Glowing Ominous Crimson Eye Slits */}
          <ellipse cx="100" cy="94" rx="5" ry="6" fill="#0c4a6e" />
          <ellipse cx="120" cy="94" rx="5" ry="6" fill="#0c4a6e" />
          <circle cx="100" cy="94" r="2.5" fill="#ef4444" />
          <circle cx="120" cy="94" r="2.5" fill="#ef4444" />

          {/* Eerie Ancestral Smile */}
          <path d="M102 110 Q110 118 118 110" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />

          {/* Weathered Funeral Shroud draped over Shrine Pillar */}
          <path d="M85 125 L135 125 L125 240 L95 240 Z" fill="#075985" stroke="#38bdf8" strokeWidth="2" />
          {/* Floating Sacred Holy Cotton Thread (สายสิญจน์ผูกวิญญาณ) */}
          <path d="M60 90 Q110 140 160 90" stroke="#f8fafc" strokeWidth="2" strokeDasharray="3 3" fill="none" />
        </svg>
      );

    default:
      return null;
  }
};
