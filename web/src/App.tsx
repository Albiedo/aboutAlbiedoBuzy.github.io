import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/SagarScene'
import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Works from './ui/Works'
import LoadingScreen from './ui/LoadingScreen'
import { useStore } from './store'


/**
 * Samples the rendered 3D scene beneath each word of the introduction.
 * Unlike mix-blend-mode, this switches between two exact text colors:
 * espresso on light pixels and pure white on dark pixels.
 * One GPU readback per visible text line keeps the cost low on mobile.
 */
function IntroContrastSampler() {
  const { gl } = useThree()
  const lastSample = useRef(0)

  // Run immediately after the post-processing composer has drawn the scene.
  useFrame((state) => {
    if (state.clock.elapsedTime - lastSample.current < 0.2) return
    lastSample.current = state.clock.elapsedTime

    const paragraph = document.querySelector<HTMLElement>('.hero .about-body')
    if (!paragraph) return
    const bounds = paragraph.getBoundingClientRect()
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return

    const canvas = gl.domElement
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const xScale = canvas.width / rect.width
    const yScale = canvas.height / rect.height
    const lines = new Map<number, Array<{ element: HTMLElement; x: number }>>()

    for (const element of paragraph.querySelectorAll<HTMLElement>('.intro-contrast-word')) {
      const word = element.getBoundingClientRect()
      const x = Math.floor((word.left + word.width / 2 - rect.left) * xScale)
      const y = Math.floor((rect.bottom - (word.top + word.height / 2)) * yScale)
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue
      const line = lines.get(y) ?? []
      line.push({ element, x })
      lines.set(y, line)
    }

    const context = gl.getContext()
    if (context.isContextLost()) return
    const linear = (v: number) => {
      const c = v / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }

    for (const [y, words] of lines) {
      const xs = words.map(({ x }) => x)
      const left = Math.min(...xs)
      const length = Math.max(...xs) - left + 1
      const pixels = new Uint8Array(length * 4)

      try {
        context.readPixels(left, y, length, 1, context.RGBA, context.UNSIGNED_BYTE, pixels)
      } catch {
        continue // Keep the original brown if framebuffer sampling is unavailable.
      }

      for (const { element, x } of words) {
        const index = (x - left) * 4
        if (pixels[index + 3] === 0) continue
        const luminance =
          0.2126 * linear(pixels[index]) +
          0.7152 * linear(pixels[index + 1]) +
          0.0722 * linear(pixels[index + 2])

        // Small hysteresis avoids flickering when the animated model moves.
        const wasWhite = element.dataset.contrast === 'white'
        const white = luminance < (wasWhite ? 0.28 : 0.22)
        const next = white ? 'white' : 'brown'
        if (element.dataset.contrast !== next) {
          element.dataset.contrast = next
          element.style.color = white ? '#FFFFFF' : '#382017'
        }
      }
    }
  })

  return null
}

function Backdrop() {
  // 点击空白处收起详情
  const setActive = useStore((s) => s.setActive)
  return (
    <mesh position={[0, 0, -40]} onClick={() => setActive(null)}>
      <planeGeometry args={[600, 300]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}


type Lang = 'en' | 'kn'

const COPY = {
  en: {
    title: 'Hi, Sagar here!',
    paragraphs: [
      "I'm a social media content strategist, project manager, and scriptwriter. I turn ideas into stories people connect with through culture, creativity, and digital content.",
    ],
  },
  kn: {
    title: 'ನಮಸ್ಕಾರ, ನಾನು ಸಾಗರ್!',
    paragraphs: [
      'ನಾನು ಸಾಗರ್ — ಸೋಶಿಯಲ್ ಮೀಡಿಯಾ ಕಂಟೆಂಟ್ ಸ್ಟ್ರಾಟೆಜಿಸ್ಟ್, ಪ್ರಾಜೆಕ್ಟ್ ಮ್ಯಾನೇಜರ್ ಮತ್ತು ಸ್ಕ್ರಿಪ್ಟ್ ರೈಟರ್. ಸಂಸ್ಕೃತಿ, ಸೃಜನಶೀಲತೆ ಮತ್ತು ಡಿಜಿಟಲ್ ಕಂಟೆಂಟ್ ಮೂಲಕ ಜನರೊಂದಿಗೆ ಸಂಪರ್ಕ ಬೆಸೆಯುವ ಕಥೆಗಳನ್ನು ರೂಪಿಸುತ್ತೇನೆ.',
    ],
  },
}



function Hero({ lang, cueOpacity }: { lang: Lang; cueOpacity: MotionValue<number> }) {
  const { title, paragraphs } = COPY[lang]
  const aboutRef = useRef(null)
  // 触发起点提前：about 顶部位于视口 60% 处即开始（offset[0] 进度 0），到达顶部为进度 1
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ['start 0.6', 'start start'],
  })
  // 透明度在 about 顶部升到约 30vh 时归 0：起点 60%→进度 p 时顶部在 0.6×(1−p)，
  // 令 =0.3 解得 p=0.5，故 opacity 区间 [0, 0.5]
  const blur = useTransform(scrollYProgress, [0, 0.5], ['blur(0px)', 'blur(16px)'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  // 视差：标题上升更快、字距随滚动拉开；正文上升慢一点
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -96])
  const bodyY = useTransform(scrollYProgress, [0, 1], [0, -52])
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['0.01em', '0.42em'])
  return (
    <section className="hero">
      <div className="about" lang={lang} ref={aboutRef}>
        <div className="about-intro">
          <div className="about-title-reveal">
            <motion.h1
              className="about-title"
              style={{ y: titleY, letterSpacing: titleSpacing, filter: blur, opacity }}
            >
              {title}
            </motion.h1>
          </div>
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              className="about-body"
              style={{ y: bodyY, filter: blur, opacity }}
            >
              {p.split(/(\s+)/).map((part, j) =>
                /^\s+$/.test(part)
                  ? part
                  : <span className="intro-contrast-word" key={j}>{part}</span>
              )}
            </motion.p>
          ))}
        </div>
      </div>
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        <span className="scroll-cue-label">{lang === 'en' ? 'SCROLL' : '向下滚动'}</span>
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
      </motion.div>
    </section>
  )
}


function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button
      className="lang-toggle"
      onClick={onToggle}
      aria-label="Switch between English and Kannada"
    >
      {lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}
    </button>
  )
}


export default function App() {
const [lang, setLang] = useState<Lang>('en')
  const { scrollY } = useScroll()
  // 作品区蒙层：以作品区顶部从视口底进入到视口中部的进度，驱动 3D 渐暗 + 模糊
  const worksRef = useRef(null)
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(
    worksProgress,
    [0, 1],
    ['rgba(56, 32, 23, 0)', 'rgba(56, 32, 23, 0.32)'] // 压暗减半（原 0.82）
  )
  const fogBlur = useTransform(worksProgress, [0, 1], ['blur(0px)', 'blur(10px)'])
  // 滚动渐暗：离开首屏后压暗 3D 场景，保证履历文字可读
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
  // 首屏滚动提示随之淡出
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  // 首屏底部渐变底色：开始滑动后淡出
  const heroGradientOpacity = useTransform(scrollY, [0, 240], [1, 0])
  // 磨砂右轨：进入履历区后淡入（首屏不磨砂）
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const railOpacity = useTransform(scrollY, [vh * 0.5, vh * 1.1], [0, 1])
  // 首屏装饰画框/角标：滚动后淡出
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  return (
    <>
      {/* 加载遮罩：模型全部加载完成前覆盖全屏，完成后淡出 */}
      <LoadingScreen />

      {/* 固定的 3D 背景 */}
      <div className="scene-bg">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 5, 19], fov: 39, near: 0.1, far: 500 }}
          gl={{ antialias: false, stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping, preserveDrawingBuffer: true }}
        >
          <color attach="background" args={['#F5A15E']} />
          <Suspense fallback={null}>
            <Backdrop />
            <Scene />
            <IntroContrastSampler />
          </Suspense>
        </Canvas>
      </div>

      {/* 滚动渐暗蒙层 */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />

      {/* 作品区固定蒙层：仅压暗（减半），模糊先注释掉 */}
      <motion.div
        className="stage-fog"
        style={{ background: fogBg /* , backdropFilter: fogBlur, WebkitBackdropFilter: fogBlur */ }}
        aria-hidden="true"
      />

      {/* 固定磨砂右轨（进入履历区淡入） */}
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      {/* 首屏底部渐变底色，滚动后淡出 —— 暂时注释查看效果 */}
      {/* <motion.div
        className="hero-gradient"
        style={{ opacity: heroGradientOpacity }}
        aria-hidden="true"
      /> */}

      {/* 中英切换暂时隐藏，默认中文 */}


<LangToggle
  lang={lang}
  onToggle={() => setLang((l) => (l === 'en' ? 'kn' : 'en'))}
/>



      {/* 首屏装饰：发丝内框 + 四角定位标 + 角标元数据（随滚动淡出） */}
      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">+</span>
        <span className="hero-mark tr">+</span>
        <span className="hero-mark bl">+</span>
        <span className="hero-mark br">+</span>
<div className="hero-meta hm-tl">
  <span className="hm-name">Sagar</span>
  <span>Content Strategist · Scriptwriter</span>
</div>
<div className="hero-meta hm-tr">Portfolio — 2026</div>
<div className="hero-meta hm-bl">Strategy · Stories · Culture</div>
<div className="hero-meta hm-right">Based in Bengaluru</div>
      </motion.div>

      {/* 全屏胶片噪点蒙层（multiply 混合） */}
      <NoiseOverlay />

      {/* 可滚动内容 */}
      <main className="content">
        <Hero lang={lang} cueOpacity={cueOpacity} />
        <Resume lang={lang} />
        <Works lang={lang} innerRef={worksRef} />
      </main>
    </>
  )
}
