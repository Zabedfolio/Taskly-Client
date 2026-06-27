"use client";

import { motion } from "framer-motion";


const W = 680;
const H = 720;


const  LAYERS = [

  {
    id: "post",
    label: "POST A TASK",
    
    cy: 178,
    

    top: { x: 390, y: 88  },

    right: { x: 560, y: 178 },
    bot: { x: 390, y: 268 },

    left: { x: 220, y: 178 },
    depth: 32,
    
    glow: {
      id: "g0",
      stops: [
        { o: "0%",   c: "#ffffff", a: 0.58 },
        { o: "16%",  c: "#ffe280", a: 0.74 },
        { o: "40%",  c: "#ff8c00", a: 0.62 },

        { o: "72%",  c: "#cc4400", a: 0.42 },
           { o: "100%", c: "#7a2000", a: 0.28 },
      ],
      cx: "38%", cy: "28%",
    },
    rimTop:    "rgba(255,185,80,0.58)",
    rimBot:    "rgba(255,80,0,0.26)",
    sideRight: ["#8b3000cc", "#3d1000b0"],
    sideLeft:  ["#5a1e00cc", "#1e0800a8"],
    labelBg:   "rgba(80,28,0,0.68)",
    labelBorder:"rgba(255,100,0,0.48)",

    labelText: "rgba(255,225,145,0.90)",
    dotStroke: "rgba(255,120,40,0.78)",

    dotFill:   "#ff8030",
    dotHighlight:"rgba(255,225,155,0.92)",
    ambientFill:"#ff6600",
    delay: 0.12,
     },
  {
    id: "proposals",

    label: "GET PROPOSALS",
    cy: 400,

    top:   { x: 390, y: 312 },
      right: { x: 560, y: 400 },

    bot:   { x: 390, y: 488 },
    left:  { x: 220, y: 400 },
    depth: 30,
    glow: {
      id: "g1",
      stops: [
        { o: "0%",   c: "#ffffff", a: 0.48 },
        { o: "18%",  c: "#ffcc60", a: 0.66 },
        { o: "44%",  c: "#ff7010", a: 0.54 },
        { o: "76%",  c: "#aa3800", a: 0.36 },
        { o: "100%", c: "#601800", a: 0.22 },

      ],
      cx: "38%", cy: "28%",
      },
    rimTop:    "rgba(255,165,60,0.50)",
    rimBot:    "rgba(255,70,0,0.22)",
    sideRight: ["#6a2500cc", "#2a0e00b0"],
    sideLeft:  ["#451800b8", "#160800a0"],
    labelBg:   "rgba(65,22,0,0.68)",
    labelBorder:"rgba(255,90,0,0.42)",
    labelText: "rgba(255,215,125,0.84)",
    dotStroke: "rgba(255,110,30,0.70)",
    dotFill:   "#ff7020",
    dotHighlight:"rgba(255,205,135,0.88)",
    ambientFill:"#ff6600",
    delay: 0.34,

    },
  {
    id: "hire",
    label: "HIRE & PAY",
    cy: 590,

    top:   { x: 390, y: 504 },
    right: { x: 560, y: 590 },
    bot:   { x: 390, y: 676 },
    left:  { x: 220, y: 590 },
    depth: 28,
    glow: {
      id: "g2",
      stops: [
        { o: "0%",   c: "#ffffff", a: 0.36 },
        { o: "20%",  c: "#ffba70", a: 0.52 },

        { o: "48%",  c: "#ff6020", a: 0.36 },
        { o: "80%",  c: "#803000", a: 0.22 },
        { o: "100%", c: "#3a1200", a: 0.14 },

      ],

      cx: "38%", cy: "28%",
    },
    rimTop:    "rgba(255,145,52,0.44)",
       rimBot:    "rgba(255,60,0,0.18)",
    sideRight: ["#4a1e00b8", "#180a00a0"],
    sideLeft:  ["#301400b0", "#0e0500a0"],
    labelBg:   "rgba(50,18,0,0.68)",
    labelBorder:"rgba(255,80,0,0.36)",

    labelText: "rgba(255,198,104,0.78)",
    dotStroke: "rgba(255,100,20,0.62)",
    dotFill:   "#ff9040",
    dotHighlight:"rgba(255,188,112,0.82)",
    ambientFill:"#ff6600",
    delay: 0.58,
  },
];


function  offsetPoint(point, toward, distance) {
  const dx = toward.x - point.x;

  const dy = toward.y - point.y;
  const  length = Math.hypot(dx, dy);

  if (length === 0) {
    return   point;
  }

  const ratio = Math.min(distance / length, 0.42);
  return {
       x: point.x + dx * ratio,
    y: point.y + dy * ratio,
  };
}

function curvedPolygonPath(points, radius = 14) {
  return points
    .map((point, index) => {
      const prev = points[(index - 1 + points.length) % points.length];

      const next = points[(index + 1) % points.length];
      const  before = offsetPoint(point, prev, radius);
      const  after = offsetPoint(point, next, radius);
      const  command = index === 0 ? "M" : "L";

      return `${command} ${before.x},${before.y} Q ${point.x},${point.y} ${after.x},${after.y}`;
      })

    .join(" ")
    .concat(" Z");
}


function curvedPolylinePath(points, radius = 12) {

  if (points.length < 2) {
    return "";
  }

  const [start, ...rest] = points;
  let path = `M ${start.x},${start.y}`;

  rest.forEach((point, index) => {
    const isLast = index === rest.length - 1;

    if (isLast) {
      path += ` L ${point.x},${point.y}`;
      return;
    }

    const next = rest[index + 1];
    const before = offsetPoint(point, points[index], radius);
    const after = offsetPoint(point, next, radius);
    path += ` L ${before.x},${before.y} Q ${point.x},${point.y} ${after.x},${after.y}`;
  });

  return path;
}




function IsoGrid() {
  const stroke = "rgba(180,200,255,0.075)";
  const sw = "0.55";

  
  const rLines = [];
  const  lLines = [];
  const step = 112; 

  for (let i = -2; i <= 8; i++) {
    const x0 = i * step;
    
    rLines.push(
      <line key={`r${i}`} x1={x0} y1={0} x2={x0 + H * 2} y2={H} stroke={stroke} strokeWidth={sw} />
    );
    
    lLines.push(
      <line key={`l${i}`} x1={x0} y1={0} x2={x0 - H * 2} y2={H} stroke={stroke} strokeWidth={sw} />
    );
  }

  return   <g>{rLines}{lLines}</g>;
}


function IsoLayer({ cfg }) {
  const  { top, right, bot, left, depth } = cfg;

  
  const rTop  = { x: right.x, y: right.y + depth };
  const rBot  = { x: bot.x,   y: bot.y   + depth };
  const lTop  = { x: left.x,  y: left.y  + depth };
  const lBot  = { x: bot.x,   y: bot.y   + depth }; 

  const glowId     = `${cfg.glow.id}-top`;

  const  rGradId    = `${cfg.glow.id}-right`;
   const lGradId    = `${cfg.glow.id}-left`;
  const clipId     = `clip-${cfg.id}`;
  const filterId   = `bloom-${cfg.id}`;

  
  const labelW  = cfg.label.length > 11 ? 178 : 158;

  const labelX  = left.x - labelW - 8;
  const labelY  = cfg.cy - 16;
  const topPath = curvedPolygonPath([top, right, bot, left], 18);
  const  rightFacePath = curvedPolygonPath([right, bot, rBot, rTop], 12);
  const leftFacePath = curvedPolygonPath([left, bot, lBot, lTop], 12);
  const topRimPath = curvedPolylinePath([left, top, right], 18);
  const  bottomRimPath = curvedPolylinePath([left, bot, right], 18);

  return (
    <motion.g
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: cfg.delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <defs>
        
        <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        
        <radialGradient id={glowId} cx={cfg.glow.cx} cy={cfg.glow.cy} r="65%" gradientUnits="objectBoundingBox">
          {cfg.glow.stops.map((s) => (
            <stop key={s.o} offset={s.o} stopColor={s.c} stopOpacity={s.a} />
          ))}
        </radialGradient>

        

        <linearGradient id={rGradId} x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%"   stopColor={cfg.sideRight[0]} />
          <stop offset="100%" stopColor={cfg.sideRight[1]} />
        </linearGradient>
        <linearGradient id={lGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={cfg.sideLeft[0]} />
          <stop offset="100%" stopColor={cfg.sideLeft[1]} />
        </linearGradient>

        
        <clipPath id={clipId}>
          <path d={topPath} />
        </clipPath>
        </defs>

      
      <ellipse
        cx={(top.x + bot.x) / 2}
        cy={cfg.cy + 12}
        rx={180} ry={100}

        fill={cfg.ambientFill}
        opacity={0.06}
        style={{ filter: "blur(28px)" }}
      />

      
      <path
        d={rightFacePath}
        fill={`url(#${rGradId})`}
        stroke="rgba(255,100,30,0.16)"
           strokeWidth="0.5"
        />

      
      <path

        d={leftFacePath}
          fill={`url(#${lGradId})`}
        stroke="rgba(255,70,0,0.10)"
        strokeWidth="0.5"
      />

      
       {cfg.id === "hire" && (
        <path
          d={topPath}
          fill="url(#surfgrid)"
          clipPath={`url(#${clipId})`}
        />
      )}

      
      <path
        d={topPath}
        fill="rgba(140,45,0,0.28)"

      />

      
      <path

        d={topPath}
        fill={`url(#${glowId})`}
      />

      
      <path
        d={topRimPath}
        fill="none"
        stroke={cfg.rimTop}

         strokeWidth="1.2"
        strokeLinecap="round"

      />
      
        <path
        d={bottomRimPath}
        fill="none"
        stroke={cfg.rimBot}
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      
      <line x1={bot.x}   y1={bot.y}   x2={rBot.x} y2={rBot.y} stroke="rgba(255,70,0,0.18)" strokeWidth="0.55"/>
      <line x1={left.x}  y1={left.y}  x2={lTop.x} y2={lTop.y} stroke="rgba(255,70,0,0.14)" strokeWidth="0.55"/>
      <line x1={right.x} y1={right.y} x2={rTop.x} y2={rTop.y} stroke="rgba(255,70,0,0.14)" strokeWidth="0.55"/>
      
      <line x1={rBot.x} y1={rBot.y} x2={rTop.x} y2={rTop.y} stroke="rgba(255,60,0,0.12)" strokeWidth="0.5"/>
      <line x1={lBot.x} y1={lBot.y} x2={lTop.x} y2={lTop.y} stroke="rgba(255,55,0,0.10)" strokeWidth="0.5"/>

      
      <line
        x1={left.x - 6} y1={cfg.cy}
        x2={390 - 18}    y2={cfg.cy}
        stroke="rgba(255,115,40,0.48)"

        strokeWidth="0.9"
        strokeDasharray="4 4"
      />

      
      <rect
        x={labelX} y={labelY}
        width={labelW} height={32}
        rx={3}
        fill={cfg.labelBg}
        stroke={cfg.labelBorder}
        strokeWidth="1"
      />
      
      <rect
        x={labelX + 1} y={labelY + 1}
        width={labelW - 2} height={13}
        rx={2}

        fill="rgba(255,150,50,0.06)"
      />
         <text

        x={labelX + 14} y={labelY + 20}
        fontFamily="'JetBrains Mono','Fira Code','Courier New',monospace"
        fontSize={9.5}
        fontWeight={700}
        letterSpacing={1.6}
        fill={cfg.labelText}
      >
        {cfg.label}
         </text>

      
      <circle
         cx={390} cy={cfg.cy} r={15}
        fill="rgba(18,5,0,0.92)"
        stroke={cfg.dotStroke}
        strokeWidth={1.4}
        filter={`url(#${filterId})`}
      />
      
      <polygon
        points={`390,${cfg.cy - 7} 397,${cfg.cy} 390,${cfg.cy + 7} 383,${cfg.cy}`}
           fill={cfg.dotFill}
        opacity={0.94}

      />
      
        <circle cx={390} cy={cfg.cy} r={2.4} fill={cfg.dotHighlight} />
    </motion.g>
  );
}


export default function  HeroLayers() {
  return (
    <div className="relative flex items-center justify-center select-none">
      
      <div
        className="pointer-events-none absolute"
           style={{
          width: 420,

          height: 560,
          top: "50%",
          left: "50%",
             transform: "translate(-50%, -52%)",

            background:
            "radial-gradient(ellipse at 52% 34%, rgba(255,100,0,0.09) 0%, rgba(255,70,0,0.04) 50%, transparent 72%)",
          filter: "blur(32px)",
        }}
      />


      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          
          <pattern
            id="surfgrid"
            x="0" y="0"

            width="30" height="17.32"
            patternUnits="userSpaceOnUse"
          >
            <path

              d="M0 8.66 L15 0 L30 8.66 L15 17.32 Z"
              fill="none"
              stroke="rgba(255,140,60,0.16)"
              strokeWidth="0.5"
            />

          </pattern>
        </defs>

        
        <IsoGrid />

        

        <line
          x1={390} y1={30}
          x2={390} y2={H - 20}
          stroke="rgba(255,100,0,0.17)"
          strokeWidth="0.7"
          strokeDasharray="5 9"
        />

        
        {[...LAYERS].reverse().map((cfg) => (
          <IsoLayer key={cfg.id} cfg={cfg} />
        ))}
      </svg>
    </div>
  );
}
