import React, { useState } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import FloatingCard from './components/FloatingCard';
import GlowingIcon from './components/GlowingIcon';
import ProgressBar from './components/ProgressBar';
import RippleButton from './components/RippleButton';
import QuantumCircuitBuilder from './components/QuantumCircuitBuilder';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import LessonPage from './pages/LessonPage';
import TopicReviewPanel from './components/TopicReviewPanel';
import AnalyticsPage from './pages/AnalyticsPage';
import FacultyPage from './pages/FacultyPage';
import './styles/globals.css';
import './styles/colors.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/utils.css';

const lessons = [
  { icon: '◈', title: 'Qubits & Superposition', detail: 'Build intuition for quantum states.', progress: 72, color: 'cyan' },
  { icon: '⌁', title: 'Entanglement Lab', detail: 'Explore non-local correlations.', progress: 38, color: 'violet' },
  { icon: '✦', title: 'Quantum Algorithms', detail: 'Turn amplitudes into advantage.', progress: 14, color: 'green' },
];

const roadmap = [
  { number: '01', title: 'Quantum Foundations', detail: 'States, measurement, and notation', status: 'complete', icon: '✓' },
  { number: '02', title: 'Qubits & Gates', detail: 'Build your first circuits', status: 'current', icon: '◈' },
  { number: '03', title: 'Entanglement', detail: 'Correlations beyond classical physics', status: 'unlocked', icon: '⌁' },
  { number: '04', title: 'Quantum Algorithms', detail: 'Search, speed-up, and advantage', status: 'locked', icon: '◇' },
  { number: '05', title: 'The Quantum Frontier', detail: 'Error correction and the future', status: 'locked', icon: '◇' },
];

const achievements = [
  { icon: '⚡', title: 'First circuit', detail: 'Built your first quantum circuit', tone: 'cyan' },
  { icon: '◒', title: 'Seven concepts', detail: 'Mastered 7 core concepts', tone: 'violet' },
  { icon: '✦', title: 'Early explorer', detail: 'Completed a lesson before 9 AM', tone: 'green' },
];

const courseLevels = [
  { level: 1, title: 'Introduction to Qubits', description: 'Meet the quantum bit and learn how it differs from a classical bit.', mastery: 70, status: 'complete', icon: '01' },
  { level: 2, title: 'Superposition Basics', description: 'Understand probability amplitudes and what it means to hold multiple states.', mastery: 70, status: 'current', icon: '02' },
  { level: 3, title: 'Entanglement', description: 'Explore quantum correlations and the link between distant qubits.', mastery: 75, status: 'unlocked', icon: '03' },
  { level: 4, title: 'Quantum Gates', description: 'Compose X, Y, Z, and Hadamard gates into useful circuits.', mastery: 80, status: 'locked', icon: '04' },
  { level: 5, title: 'Deutsch-Jozsa Algorithm', description: 'Discover how a quantum oracle can classify functions efficiently.', mastery: 80, status: 'locked', icon: '05' },
  { level: 6, title: "Grover's Algorithm", description: 'Learn quantum search and the speed-up behind amplitude amplification.', mastery: 85, status: 'locked', icon: '06' },
  { level: 7, title: "Shor's Algorithm Basics", description: 'See how period finding connects quantum computing to cryptography.', mastery: 90, status: 'locked', icon: '07' },
];

export default function App() {
  const { user, isGuest, session } = useAuth();
  const [startedLevel, setStartedLevel] = useState(2);
  const [hash, setHash] = useState(window.location.hash);
  React.useEffect(() => { const updateHash = () => setHash(window.location.hash); window.addEventListener('hashchange', updateHash); return () => window.removeEventListener('hashchange', updateHash); }, []);
  if (!user) return <AuthPage />;
  if (hash === '#profile') return <ProfilePage />;
  if (hash === '#analytics') return <AnalyticsPage />;
  if (hash === '#faculty' && (user.role === 'faculty' || user.role === 'admin')) return <FacultyPage />;
  if (hash.startsWith('#lesson-')) return <LessonPage level={Number(hash.replace('#lesson-', ''))} />;
  const learnerName = user.displayName?.split(' ')[0] || 'Explorer';

  return (
    <main className="dashboard-shell page-enter">
      <AnimatedBackground />
      <nav className="glass-nav" aria-label="Primary navigation">
        <a className="brand-mark" href="/" aria-label="Quantum Atlas home"><GlowingIcon label="Quantum Atlas">⚛</GlowingIcon> QUANTUM ATLAS</a>
        <div className="nav-links">
          <a className="nav-link" aria-current="page" href="#learn">Learn</a>
          <a className="nav-link" href="#labs">Labs</a>
          <a className="nav-link" href="#progress">Progress</a>
          <a className="nav-link" href="#analytics">Analytics</a>
          {(user.role === 'faculty' || user.role === 'admin') && <a className="nav-link faculty-nav-link" href="#faculty">Faculty</a>}
          <a className="nav-link tutor-nav-link" href="#lesson-2">AI Tutor</a>
        </div>
        {isGuest ? <span className="guest-chip">GUEST</span> : <a className="profile-button profile-link" href="#profile" aria-label="Open profile">{user.displayName?.slice(0, 2).toUpperCase() || 'JD'}</a>}
      </nav>

      <div className="dashboard-content" id="learn">
        <section className="welcome-row">
          <div><p className="eyebrow">Personal learning cockpit / Week 04</p><h1>Welcome back, <span className="text-gradient">{learnerName}.</span></h1><p className="muted welcome-copy">Your next breakthrough is already in motion. Pick up your path exactly where you left it.</p></div>
          <div className="welcome-meta"><span className="streak">🔥 12 day streak</span><span className="muted">Last active today, 10:42 AM</span></div>
        </section>

        <section className="hero-grid">
          <FloatingCard className="hero-card" delay={0.1}>
            <div className="resume-label"><span className="eyebrow">Continue learning</span><span className="lesson-index">12 min left</span></div>
            <h2>Qubits & Superposition</h2>
            <p className="muted hero-copy">Lesson 03 / Probability amplitudes</p>
            <ProgressBar value={72} label="Lesson progress" />
            <div className="hero-actions"><RippleButton onClick={() => document.querySelector('#lessons')?.scrollIntoView({ behavior: 'smooth' })}>Resume lesson <span>→</span></RippleButton><span className="muted">72% complete</span></div>
          </FloatingCard>
          <FloatingCard className="orb-card" delay={0.2}>
            <div className="quantum-orb"><span>ψ</span></div>
            <p className="orb-caption">CURRENT STATE</p>
            <strong>Superposition</strong>
            <span className="muted">Exploring two possibilities at once</span>
          </FloatingCard>
        </section>

        <section className="stats-grid" id="progress" aria-label="Learning summary">
          <FloatingCard delay={0.3}><span className="stat-icon">◒</span><p className="muted">Path completion</p><p className="metric">42%</p><ProgressBar value={42} label="Overall path" /></FloatingCard>
          <FloatingCard delay={0.4}><span className="stat-icon">↗</span><p className="muted">Current level</p><p className="metric">03</p><p className="success-text">Circuit architect</p></FloatingCard>
          <FloatingCard delay={0.5}><span className="stat-icon">◷</span><p className="muted">Time on platform</p><p className="metric">8.4<span className="metric-small"> hrs</span></p><p className="success-text">+52 min this week</p></FloatingCard>
        </section>
        <TopicReviewPanel session={session} isGuest={isGuest} />

        <section id="lessons" className="section-heading"><div><p className="eyebrow">Your orbit</p><h2>Pick up where you left off</h2></div><a href="#labs" className="view-link">View curriculum <span>↗</span></a></section>
        <section className="lesson-grid" id="labs" aria-label="Recommended lessons">
          {lessons.map((lesson, index) => <FloatingCard key={lesson.title} className={`lesson-card stagger-item ${lesson.color}`} delay={0.6 + index * 0.1}><div className="lesson-top"><GlowingIcon label={lesson.title}>{lesson.icon}</GlowingIcon><span className="lesson-index">0{index + 1}</span></div><h3>{lesson.title}</h3><p className="muted">{lesson.detail}</p><ProgressBar value={lesson.progress} label={`${lesson.progress}% complete`} /><a className="lesson-link" href={`#lesson-${index + 1}`}>Open lesson <span>→</span></a></FloatingCard>)}
        </section>

        <section className="section-heading"><div><p className="eyebrow">The path ahead</p><h2>Course roadmap</h2></div><span className="muted roadmap-count">2 of 5 topics unlocked</span></section>
        <section className="roadmap-card glassmorphism-card" aria-label="Course roadmap">
          <div className="roadmap-line" />
          {roadmap.map((topic, index) => <div className={`roadmap-item ${topic.status}`} key={topic.title}><div className="roadmap-node">{topic.icon}</div><div className="roadmap-copy"><span className="lesson-index">TOPIC {topic.number} · {topic.status}</span><h3>{topic.title}</h3><p className="muted">{topic.detail}</p></div>{topic.status === 'current' && <span className="current-pill">YOU ARE HERE</span>}</div>)}
        </section>

        <section className="section-heading course-heading"><div><p className="eyebrow">Quantum learning path</p><h2>Seven levels to mastery</h2></div><span className="muted">Master each gate to move forward</span></section>
        <section className="course-levels" aria-label="Quantum course levels">
          {courseLevels.map((course) => {
            const isLocked = course.status === 'locked';
            const isStarted = startedLevel === course.level;
            return <article className={`course-level glassmorphism-card ${course.status} ${isStarted ? 'is-started' : ''}`} key={course.level}>
              <div className="course-level-top"><div className="course-number">{course.icon}</div><div className="course-status">{course.status === 'complete' ? '✓ Complete' : isLocked ? '🔒 Locked' : isStarted ? 'In progress' : 'Unlocked'}</div></div>
              <h3>Level {course.level}: {course.title}</h3>
              <p className="muted">{course.description}</p>
              <div className="mastery-gate"><span>Required mastery to unlock next level</span><strong>{course.mastery}%</strong></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${course.status === 'complete' ? 100 : course.status === 'current' ? 72 : 0}%` }} /></div>
              <button className="lesson-start-button" type="button" disabled={isLocked} onClick={() => { setStartedLevel(course.level); window.location.hash = `lesson-${course.level}`; }}>{isLocked ? 'Complete previous level' : isStarted ? 'Lesson in progress' : 'Start lesson'} <span>{isLocked ? '🔒' : '→'}</span></button>
            </article>;
          })}
        </section>

        <section className="section-heading"><div><p className="eyebrow">Signals of progress</p><h2>Achievements earned</h2></div><span className="muted">3 badges unlocked</span></section>
        <section className="achievement-grid" aria-label="Achievements">
          {achievements.map((achievement) => <FloatingCard key={achievement.title} className={`achievement-card ${achievement.tone}`}><div className="achievement-icon">{achievement.icon}</div><div><h3>{achievement.title}</h3><p className="muted">{achievement.detail}</p></div><span className="achievement-check">✓</span></FloatingCard>)}
        </section>

        <section className="section-heading"><div><p className="eyebrow">Build / Run / Observe</p><h2>Quantum circuit lab</h2></div><span className="muted">3 qubits · 8 time steps</span></section>
        <QuantumCircuitBuilder />
      </div>
    </main>
  );
}
