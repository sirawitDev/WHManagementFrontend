<template>
    <div class="not-found">
        <div class="stars" aria-hidden="true">
            <span v-for="n in 80" :key="n" class="star" :style="starStyle(n)" />
        </div>

        <div class="shooting-stars" aria-hidden="true">
            <span v-for="n in 6" :key="n" class="shooting-star" :style="shootingStyle(n)" />
        </div>

        <div class="content">
            <!-- <div class="planet-wrapper" aria-hidden="true">
                <div class="planet">
                    <div class="crater crater-1" />
                    <div class="crater crater-2" />
                    <div class="crater crater-3" />
                </div>
                <div class="ring" />
            </div> -->

            <div class="error-code">
                <span class="digit">4</span>
                <span class="digit zero">0</span>
                <span class="digit">4</span>
            </div>

            <p class="subtitle">ขออภัย ไม่พบหน้าที่คุณค้นหา</p>

            <router-link to="/home" class="home-btn">
                <span class="btn-icon"><Rocket /></span>
                <span>กลับสู่หน้าหลัก</span>
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { Rocket } from 'lucide-vue-next'
function starStyle(n) {
    const seed = n * 13.7
    const x = (Math.sin(seed) * 0.5 + 0.5) * 100
    const y = (Math.cos(seed * 1.3) * 0.5 + 0.5) * 100
    const size = 1 + (Math.sin(seed * 2.1) * 0.5 + 0.5) * 2.5
    const delay = (Math.sin(seed * 3.7) * 0.5 + 0.5) * 4
    const dur = 2 + (Math.cos(seed * 1.7) * 0.5 + 0.5) * 3
    return {
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${dur}s`,
        opacity: 0.4 + (Math.sin(seed * 4.1) * 0.5 + 0.5) * 0.6,
    }
}

function shootingStyle(n) {
    const top = 5 + n * 13
    const delay = n * 2.8
    const dur = 1.8 + n * 0.3
    return {
        top: `${top}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${dur}s`,
    }
}
</script>

<style scoped>
.not-found {
    min-height: 100vh;
    width: 100%;
    background: radial-gradient(ellipse at 30% 40%, #0d1b4b 0%, #060d22 50%, #000510 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    font-family: 'Sarabun', 'Prompt', sans-serif;
}

/* ── Stars ── */
.stars {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.star {
    position: absolute;
    border-radius: 50%;
    background: #fff;
    animation: twinkle var(--dur, 3s) ease-in-out infinite;
}

@keyframes twinkle {

    0%,
    100% {
        opacity: var(--base-op, 0.6);
        transform: scale(1);
    }

    50% {
        opacity: 0.1;
        transform: scale(0.6);
    }
}

.shooting-stars {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.shooting-star {
    position: absolute;
    left: -120px;
    height: 1.5px;
    width: 80px;
    background: linear-gradient(90deg, transparent, #a8d4ff, #fff);
    border-radius: 2px;
    animation: shoot linear infinite;
    opacity: 0;
}

@keyframes shoot {
    0% {
        transform: translateX(0) rotate(-20deg);
        opacity: 0;
    }

    5% {
        opacity: 1;
    }

    60% {
        opacity: 0.7;
    }

    100% {
        transform: translateX(120vw) rotate(-20deg);
        opacity: 0;
    }
}

.content {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
}

.planet-wrapper {
    position: relative;
    width: 140px;
    height: 140px;
    margin: 0 auto 0.5rem;
}

.planet {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #7c5cbf, #3d2080 50%, #1a0a4a);
    position: absolute;
    top: 10px;
    left: 10px;
    box-shadow: inset -12px -8px 24px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 92, 191, 0.3);
    animation: floatPlanet 6s ease-in-out infinite;
}

.crater {
    position: absolute;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.2);
    box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.crater-1 {
    width: 22px;
    height: 22px;
    top: 28px;
    left: 30px;
}

.crater-2 {
    width: 14px;
    height: 14px;
    top: 60px;
    left: 55px;
}

.crater-3 {
    width: 10px;
    height: 10px;
    top: 40px;
    left: 68px;
}

.ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotateX(72deg);
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 10px solid transparent;
    border-top-color: rgba(168, 212, 255, 0.35);
    border-bottom-color: rgba(168, 212, 255, 0.15);
    animation: floatPlanet 6s ease-in-out infinite;
}

.astronaut {
    position: absolute;
    top: -10px;
    right: -4px;
    font-size: 2rem;
    animation: orbit 8s linear infinite;
    transform-origin: 60px 75px;
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
}

@keyframes orbit {
    from {
        transform: rotate(0deg) translateX(60px) rotate(0deg);
    }

    to {
        transform: rotate(360deg) translateX(60px) rotate(-360deg);
    }
}

@keyframes floatPlanet {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-8px);
    }
}

.error-code {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    line-height: 1;
}

.digit {
    font-size: clamp(5rem, 18vw, 9rem);
    font-weight: 900;
    font-family: 'Orbitron', 'Prompt', sans-serif;
    background: linear-gradient(135deg, #a8d4ff 0%, #6fa3f7 40%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
    filter: drop-shadow(0 0 30px rgba(168, 212, 255, 0.4));
}

.digit.zero {
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        filter: drop-shadow(0 0 20px rgba(168, 212, 255, 0.4));
    }

    50% {
        filter: drop-shadow(0 0 50px rgba(167, 139, 250, 0.8));
    }
}

.title {
    font-size: clamp(1.4rem, 4vw, 2rem);
    font-weight: 700;
    color: #e0eaff;
    margin: 0;
    letter-spacing: 0.05em;
}

.subtitle {
    font-size: clamp(0.9rem, 2.5vw, 1.05rem);
    color: #7a9fd4;
    line-height: 1.7;
    margin: 0;
}

.break {
    display: none;
}

.home-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.5rem;
    padding: 0.8rem 2rem;
    border-radius: 100px;
    background: linear-gradient(135deg, #3a56d4, #7c4dff);
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(124, 77, 255, 0.4), 0 0 0 0 rgba(124, 77, 255, 0);
}

.home-btn:hover {
    transform: translateY(-3px) scale(1.04);
    box-shadow: 0 8px 32px rgba(124, 77, 255, 0.6);
}

.home-btn:active {
    transform: translateY(0) scale(0.98);
}

.btn-icon {
    font-size: 1.2rem;
    animation: rocketShake 1.5s ease-in-out infinite;
}

@keyframes rocketShake {

    0%,
    100% {
        transform: rotate(0deg);
    }

    25% {
        transform: rotate(-8deg) translateY(-2px);
    }

    75% {
        transform: rotate(8deg) translateY(-2px);
    }
}

@media (min-width: 640px) {
    .break {
        display: inline;
    }

    .planet-wrapper {
        width: 180px;
        height: 180px;
    }

    .planet {
        width: 150px;
        height: 150px;
    }

    .ring {
        width: 200px;
        height: 200px;
    }

    .crater-1 {
        width: 28px;
        height: 28px;
    }

    .crater-2 {
        width: 18px;
        height: 18px;
    }

    .astronaut {
        font-size: 2.4rem;
    }

    .astronaut {
        transform-origin: 75px 90px;
    }
}

@media (min-width: 1024px) {
    .content {
        gap: 1.5rem;
    }

    .planet-wrapper {
        width: 200px;
        height: 200px;
    }

    .planet {
        width: 170px;
        height: 170px;
    }
}

@media (max-width: 380px) {
    .content {
        padding: 1.5rem 1rem;
        gap: 1rem;
    }

    .home-btn {
        padding: 0.7rem 1.5rem;
        font-size: 0.9rem;
    }
}

@media (prefers-reduced-motion: reduce) {

    .star,
    .shooting-star,
    .planet,
    .ring,
    .astronaut,
    .digit,
    .btn-icon {
        animation: none;
    }
}
</style>