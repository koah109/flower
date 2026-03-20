const scene = document.getElementById("scene");
const midImage = document.getElementById("midImage");
const MAX_FLOWERS = 600;

let flowerUid = 0;

const presets = [
  {
    kind: "flower",
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
    kind: "flower",
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
    kind: "flower",
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
  {
    kind: "heart",
    name: "heart",
    heartColor: "#ff3b4a",
    heartHighlight: "#ff7a86",
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

function makeHeartSVG(preset) {
  const uid = ++flowerUid;
  return `
    <svg class="flowerSvg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="softShadow${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.24)"/>
        </filter>
      </defs>
      <g filter="url(#softShadow${uid})">
        <path
          d="M50 88s-34-20-34-47c0-13 8-21 20-21 8 0 13 4 14 7 1-3 6-7 14-7 12 0 20 8 20 21 0 27-34 47-34 47z"
          fill="${preset.heartColor}"
          stroke="rgba(255,255,255,0.35)"
          stroke-width="3"
          opacity="0.98"
        />
        <path
          d="M40 44c-4 6-3 13 1 18"
          fill="none"
          stroke="${preset.heartHighlight}"
          stroke-width="6"
          stroke-linecap="round"
          opacity="0.7"
        />
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
  const heartIndex = Math.floor(rand(0, count));
  for (let i = 0; i < count; i++) {
    if (scene.childElementCount > MAX_FLOWERS) break;

    const el = document.createElement("span");
    el.className = "flower";

    const size = rand(22, 44);
    // Firework-like: spread outward in all directions
    const angle = rand(0, Math.PI * 2);
    const distance = rand(120, 360) * (size / 36); // scale with flower size
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    // Timing mới:
    // - Rơi chậm thêm 3 lần => moveDuration = base * 3
    // - Biến mất chậm thêm gấp 2 lần => fadeDuration = base * 2
    const baseDuration = rand(9600, 18600);
    const durationMove = Math.round(baseDuration * 2);
    const durationFade = Math.round(baseDuration / 2);
    const delay = rand(0, 340);
    const rot0 = rand(-180, 180);
    const rot1 = rot0 + rand(-540, 540);

    el.style.setProperty("--x", `${x + rand(-14, 14)}px`);
    el.style.setProperty("--y", `${y + rand(-12, 16)}px`);
    el.style.setProperty("--size", `${size}px`);
    el.style.setProperty("--dx", `${dx}`);
    el.style.setProperty("--dy", `${dy}`);
    el.style.setProperty("--moveDuration", `${durationMove}ms`);
    el.style.setProperty("--fadeDuration", `${durationFade}ms`);
    el.style.setProperty("--delay", `${delay}ms`);
    el.style.setProperty("--rot0", `${rot0}deg`);
    el.style.setProperty("--rot1", `${rot1}deg`);

    if (i === heartIndex) {
      const heartPreset = presets.find((p) => p.kind === "heart");
      el.innerHTML = makeHeartSVG(heartPreset);
    } else {
      const preset = pickPreset();
      const petalPhaseDeg = rand(0, 360);
      el.innerHTML = makeFlowerSVG(preset, petalPhaseDeg);
    }

    // Có 2 animation (move + fade) => chỉ remove khi kết thúc move
    el.addEventListener("animationend", (ev) => {
      if (ev.animationName === "fallMove") el.remove();
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

