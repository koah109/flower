const scene = document.getElementById("scene");
const midImage = document.getElementById("midImage");
const MAX_FLOWERS = 600;

let flowerUid = 0;

const presets = [
  {
    name: "blue",
    // Hoa xanh trong ảnh thường có cảm giác "clover" (ít cánh hơn)
    petalCount: 5,
    petalColor: "#2f9cff",
    petalHighlight: "#9ad5ff",
    centerOuter: "#ffd24d",
    centerInner: "#fff2b8",
    centerR: 14,
    petalRx: 12,
    petalRy: 26,
    petalCy: 18,
    petalStroke: "rgba(255,255,255,0.30)",
  },
  {
    name: "yellow",
    // Hoa vàng nhìn giống "daisy" (nhiều cánh)
    petalCount: 8,
    petalColor: "#ffcc33",
    petalHighlight: "#ffe07a",
    centerOuter: "#ff8a2b",
    centerInner: "#fff0c2",
    centerR: 14,
    petalRx: 9,
    petalRy: 19,
    petalCy: 18,
    petalStroke: "rgba(255,255,255,0.38)",
  },
  {
    name: "red",
    // Hoa đỏ kiểu daisy
    petalCount: 8,
    petalColor: "#ff4d6d",
    petalHighlight: "#ff8aa0",
    centerOuter: "#ffcc33",
    centerInner: "#fff0c2",
    centerR: 14,
    petalRx: 10,
    petalRy: 20,
    petalCy: 18,
    petalStroke: "rgba(255,255,255,0.40)",
  },
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pickPreset() {
  // Tăng tỉ lệ hoa đỏ
  // - red: ~40%
  // - blue: ~40%
  // - yellow: ~20%
  const r = Math.random();
  if (r < 0.4) return presets[2]; // red
  if (r < 0.8) return presets[0]; // blue
  return presets[1]; // yellow
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeFlowerSVG(preset, petalPhaseDeg) {
  const uid = ++flowerUid;
  const step = 360 / preset.petalCount;

  // Render petal ellipses around center
  let petals = "";
  for (let i = 0; i < preset.petalCount; i++) {
    const angle = petalPhaseDeg + i * step;
    petals += `
      <g transform="rotate(${angle} 50 50)">
        <ellipse cx="50" cy="${preset.petalCy}" rx="${preset.petalRx}" ry="${preset.petalRy}"
          fill="${preset.petalColor}" stroke="${preset.petalStroke}" stroke-width="3" opacity="0.98" />
        <ellipse cx="50" cy="${preset.petalCy}" rx="${preset.petalRx * 0.58}" ry="${preset.petalRy * 0.58}"
          fill="${preset.petalHighlight}" opacity="0.55" />
      </g>
    `;
  }

  const shadowOpacity = preset.name === "blue" ? 0.18 : 0.22;

  return `
    <svg class="flowerSvg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="softShadow${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,${shadowOpacity})"/>
        </filter>
      </defs>

      <g filter="url(#softShadow${uid})">
        ${petals}
        <circle cx="50" cy="54" r="${preset.centerR}" fill="${preset.centerOuter}" stroke="rgba(255,255,255,0.25)" stroke-width="3" />
        <circle cx="50" cy="54" r="${preset.centerR * 0.55}" fill="${preset.centerInner}" opacity="0.95" />
        <circle cx="44" cy="48" r="${preset.centerR * 0.22}" fill="#ffffff" opacity="0.35" />
      </g>
    </svg>
  `;
}

function spawnFlowers(clientX, clientY) {
  const rect = scene.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  // Mỗi lần click tạo đúng 20 bông
  const count = 20;
  for (let i = 0; i < count; i++) {
    if (scene.childElementCount > MAX_FLOWERS) break;

    const preset = pickPreset();
    const el = document.createElement("span");
    el.className = "flower";

    const size = rand(22, 44);
    const drift = rand(-20, 20);
    // Tăng thời gian để rơi chậm hơn
    // Làm chậm 3 lần so với trước
    const duration = rand(9600, 18600);
    const delay = rand(0, 340);
    const rot0 = rand(-180, 180);
    const rot1 = rot0 + rand(-540, 540);

    el.style.setProperty("--x", `${x + rand(-14, 14)}px`);
    el.style.setProperty("--y", `${y + rand(-12, 16)}px`);
    el.style.setProperty("--size", `${size}px`);
    el.style.setProperty("--drift", `${drift}`);
    el.style.setProperty("--duration", `${duration}ms`);
    el.style.setProperty("--delay", `${delay}ms`);
    el.style.setProperty("--rot0", `${rot0}deg`);
    el.style.setProperty("--rot1", `${rot1}deg`);

    const petalPhaseDeg = rand(0, 360);
    el.innerHTML = makeFlowerSVG(preset, petalPhaseDeg);

    el.addEventListener("animationend", () => {
      el.remove();
    });

    scene.appendChild(el);
  }
}

// Theo dõi hướng di chuyển chuột để lật ảnh
let prevMoveX = null;

scene.addEventListener("pointerdown", (e) => {
  spawnFlowers(e.clientX, e.clientY);
  prevMoveX = e.clientX;
});

// Di chuyển chuột/touch để lật ảnh theo hướng
scene.addEventListener("pointermove", (e) => {
  // Logic lật ảnh: sang phải thì lật, sang trái thì giữ nguyên
  if (midImage && prevMoveX !== null) {
    if (e.clientX > prevMoveX) midImage.classList.add("flipped");
    else if (e.clientX < prevMoveX) midImage.classList.remove("flipped");
  }
  prevMoveX = e.clientX;
});

