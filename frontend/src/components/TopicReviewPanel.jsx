import React, { useEffect, useState } from 'react';
import FloatingCard from './FloatingCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function TopicReviewPanel({ session, isGuest }) {
  const [topics, setTopics] = useState([]);
  useEffect(() => {
    if (isGuest || !session?.accessToken) return undefined;
    fetch(`${API_URL}/quiz-analytics/dashboard`, { headers: { Authorization: `Bearer ${session.accessToken}` } }).then((response) => response.ok ? response.json() : null).then((body) => body && setTopics(body.topicsNeedingReview || [])).catch(() => undefined);
    return undefined;
  }, [isGuest, session]);
  if (isGuest || !topics.length) return null;
  return <section className="review-panel"><div className="section-heading"><div><p className="eyebrow">Personalized review</p><h2>Topics needing review</h2></div><span className="muted">Strengthen these foundations</span></div><div className="review-grid">{topics.map((topic) => <FloatingCard key={topic.topic_slug} className="review-card"><span className="review-icon">↻</span><div><h3>{topic.topic_slug.replaceAll('-', ' ')}</h3><p className="muted">Latest score {Math.round(topic.latest_score)}% · {Math.round(topic.time_spent_seconds / 60)} min spent</p></div><a href={`#lesson-${topic.topic_slug.includes('superposition') ? 2 : 1}`} className="lesson-link">Review <span>→</span></a></FloatingCard>)}</div></section>;
}
