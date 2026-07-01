import React from 'react';
import { motion } from 'framer-motion';
import type { LearningWeather } from '../../../types/learningTree';
import { WEATHER_EMOJIS } from '../../../types/learningTree';

interface WeatherDisplayProps {
  weather: LearningWeather;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather }) => {
  const { type, motivation, curiosity, confidence, stress } = weather;
  const emoji = WEATHER_EMOJIS[type];

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'high':
      case 'excellent':
        return '#32CD32';
      case 'good':
        return '#FFD700';
      case 'medium':
        return '#FFA500';
      case 'low':
        return '#DC143C';
      default:
        return '#666';
    }
  };

  const weatherMeaning = {
    spring: 'New skills, exploration phase',
    summer: 'Peak productivity',
    autumn: 'Revision, consolidation',
    winter: 'Burnout risk - take it easy'
  };

  return (
    <motion.div
      className="weather-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="weather-header">
        <span className="weather-emoji" style={{ fontSize: '2rem' }}>{emoji}</span>
        <div className="weather-info">
          <h4>Today's Learning Weather</h4>
          <p className="weather-meaning">{weatherMeaning[type]}</p>
        </div>
      </div>

      <div className="weather-metrics">
        <div className="weather-metric">
          <span className="metric-label">☀ Motivation</span>
          <span className="metric-value" style={{ color: getEnergyColor(motivation) }}>
            {motivation.charAt(0).toUpperCase() + motivation.slice(1)}
          </span>
        </div>

        <div className="weather-metric">
          <span className="metric-label">🌈 Curiosity</span>
          <span className="metric-value" style={{ color: getEnergyColor(curiosity) }}>
            {curiosity.charAt(0).toUpperCase() + curiosity.slice(1)}
          </span>
        </div>

        <div className="weather-metric">
          <span className="metric-label">☁ Confidence</span>
          <span className="metric-value" style={{ color: getEnergyColor(confidence) }}>
            {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
          </span>
        </div>

        <div className="weather-metric">
          <span className="metric-label">🌧 Stress</span>
          <span className="metric-value" style={{ color: getEnergyColor(stress) }}>
            {stress.charAt(0).toUpperCase() + stress.slice(1)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherDisplay;