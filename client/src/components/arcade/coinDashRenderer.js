/**
 * coinDashRenderer.js
 * 
 * Modular high-DPI Canvas Renderer for Coin Dash 2.0:
 * - 5 Parallax biomes (Cyber Grid, Bug Forest, Neon City, Sky Islands, Crystal Caverns)
 * - Animated BugBuddy mascot with run bobbing, jump stretch, duck squash, shield bubble, magnet field
 * - Distinct obstacle types: ground spikes, hover drones, laser barriers
 * - Collectible animations: rotating coins, sparkling emerald gems, power-up beacons
 * - Neon particle explosions and trailing sparks
 */

export function drawParallaxBackground(ctx, w, h, groundY, env, bgOffset, frame) {
  // 1. Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  const colors = env.skyGradient || ['#050811', '#0b1329'];
  skyGrad.addColorStop(0, colors[0]);
  skyGrad.addColorStop(1, colors[1]);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, groundY);

  // 2. Far Layer: Distant mountains / skyline / canopy
  ctx.save();
  ctx.fillStyle = env.gridColor || 'rgba(56, 189, 248, 0.08)';
  const farOffset = (bgOffset * 0.15) % 300;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = -300; x < w + 300; x += 150) {
    const peakX = x - farOffset;
    const peakY = groundY - 70 - Math.sin((x + 50) * 0.02) * 35;
    ctx.lineTo(peakX, peakY);
    ctx.lineTo(peakX + 75, groundY - 20);
  }
  ctx.lineTo(w, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 3. Midground Layer: City towers, forest trees, or crystal pillars
  ctx.save();
  ctx.fillStyle = env.particleColor ? `${env.particleColor}22` : 'rgba(16, 185, 129, 0.12)';
  const midOffset = (bgOffset * 0.4) % 200;
  for (let x = -200; x < w + 200; x += 80) {
    const rx = x - midOffset;
    const towerH = 40 + ((Math.abs(Math.sin(x)) * 70) | 0);
    ctx.fillRect(rx, groundY - towerH, 45, towerH);
    // Beacon lights atop structures
    ctx.fillStyle = env.neonColor || '#10b981';
    ctx.beginPath();
    ctx.arc(rx + 22.5, groundY - towerH - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = env.particleColor ? `${env.particleColor}22` : 'rgba(16, 185, 129, 0.12)';
  }
  ctx.restore();

  // 4. Ground Bed & Neon Grid Horizon
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
  groundGrad.addColorStop(0, env.groundColor || '#0f172a');
  groundGrad.addColorStop(1, '#020617');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, w, h - groundY);

  // Neon Horizon Line
  ctx.strokeStyle = env.neonColor || '#10b981';
  ctx.lineWidth = 3;
  ctx.shadowColor = env.neonColor || '#10b981';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Perspective speed lines on the ground
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  const gridSpeed = (bgOffset * 1.5) % 40;
  for (let gx = -40; gx < w + 40; gx += 40) {
    const curX = gx - gridSpeed;
    ctx.beginPath();
    ctx.moveTo(curX, groundY);
    ctx.lineTo(curX - 60, h);
    ctx.stroke();
  }
  // Horizontal ground lines
  for (let gy = groundY + 12; gy < h; gy += 15) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }
}

export function drawMascotPlayer(ctx, player, equippedSkin, activeShield, activeMagnet, frame) {
  const { x, y, w, h, isGrounded, isDucking } = player;

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);

  // Ground drop shadow
  if (!isDucking) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    const shadowScale = Math.max(0.4, 1 - (player.y / 260) * 0.4);
    ctx.ellipse(0, h / 2 + 6, (w / 2) * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Running bobbing offset
  const bob = isGrounded && !isDucking ? Math.sin(frame * 0.25) * 2.5 : 0;
  ctx.translate(0, bob);

  // Skin color selection
  let bodyColor = '#10b981';
  let accentColor = '#34d399';
  if (equippedSkin === 'skin_cyber') {
    bodyColor = '#06b6d4';
    accentColor = '#f43f5e';
  } else if (equippedSkin === 'skin_golden') {
    bodyColor = '#f59e0b';
    accentColor = '#fbbf24';
  } else if (equippedSkin === 'skin_retro') {
    bodyColor = '#22c55e';
    accentColor = '#86efac';
  } else if (equippedSkin === 'skin_beetle') {
    bodyColor = '#8b5cf6';
    accentColor = '#c084fc';
  }

  // Mascot Body
  ctx.fillStyle = bodyColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  if (isDucking) {
    ctx.ellipse(0, 2, w / 1.7, h / 2.2, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(0, 0, w / 2.2, h / 2.1, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.shadowBlur = 0;

  // Eyes (Blinking/Looking Forward)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  const eyeY = isDucking ? -1 : -4;
  ctx.arc(5, eyeY, 5, 0, Math.PI * 2);
  ctx.arc(13, eyeY, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(6.5, eyeY, 2.5, 0, Math.PI * 2);
  ctx.arc(14.5, eyeY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Antennae
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-2, -h / 2.5);
  ctx.lineTo(-6, -h / 2 - 8);
  ctx.moveTo(4, -h / 2.5);
  ctx.lineTo(8, -h / 2 - 8);
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(-6, -h / 2 - 8, 3, 0, Math.PI * 2);
  ctx.arc(8, -h / 2 - 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Active Energy Shield Bubble
  if (activeShield) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const pulse = Math.sin(frame * 0.15) * 3;
    ctx.arc(0, 0, (w / 1.8) + 8 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
  }

  // Active Coin Magnet Field Aura
  if (activeMagnet) {
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, (w / 1.5) + 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

export function drawObstacles(ctx, obstacles, env) {
  obstacles.forEach((obs) => {
    ctx.save();
    if (obs.type === 'drone') {
      // Hovering Glitch Drone
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#e11d48';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2.2, 0, Math.PI * 2);
      ctx.fill();
      // Rotor Blades
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(obs.x, obs.y + obs.h / 2);
      ctx.lineTo(obs.x + obs.w, obs.y + obs.h / 2);
      ctx.stroke();
    } else if (obs.type === 'laser') {
      // Vertical Laser Barrier
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.w / 2, obs.y);
      ctx.lineTo(obs.x + obs.w / 2, obs.y + obs.h);
      ctx.stroke();
    } else {
      // Ground Firewall Spikes
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(obs.x, obs.y + obs.h);
      ctx.lineTo(obs.x + obs.w / 2, obs.y);
      ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  });
}

export function drawCollectibles(ctx, coins, gems, powerups, frame) {
  // 1. Coins
  coins.forEach((c) => {
    ctx.save();
    ctx.translate(c.x, c.y);
    const wobble = Math.sin(frame * 0.15 + c.x * 0.05);
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(3, 9 * Math.abs(wobble)), 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  });

  // 2. Emerald Gems (Rare)
  gems.forEach((g) => {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(9, 0);
    ctx.lineTo(0, 11);
    ctx.lineTo(-9, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // 3. Power-Up Orbs
  powerups.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const color = p.kind === 'magnet' ? '#eab308' : p.kind === 'shield' ? '#38bdf8' : '#a855f7';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.kind === 'magnet' ? 'M' : p.kind === 'shield' ? 'S' : 'B', 0, 1);
    ctx.restore();
  });
}

export function drawParticles(ctx, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    ctx.save();
    ctx.fillStyle = p.color || '#38bdf8';
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size || 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
