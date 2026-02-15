import { useState } from 'react';
import type { Reward, UserProgress } from '../types';

interface RewardsProps {
  userProgress: UserProgress;
  rewards: Reward[];
  onRewardClick: (reward: Reward) => void;
  onBack: () => void;
}

export default function Rewards({ userProgress, rewards, onRewardClick, onBack }: RewardsProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const handleRewardClick = (reward: Reward) => {
    if (reward.unlocked) {
      setSelectedReward(reward);
      onRewardClick(reward);
    }
  };

  const handleCloseModal = () => {
    setSelectedReward(null);
  };

  const unlockedRewards = rewards.filter(r => r.unlocked);
  const lockedRewards = rewards.filter(r => !r.unlocked);

  return (
    <div className="rewards-container">
      <div className="rewards-header">
        <button className="back-button" onClick={onBack}>
          ← Назад
        </button>
        <h1 className="rewards-title">Награды</h1>
      </div>

      <div className="progress-summary">
        <div className="progress-card">
          <div className="progress-icon">🏆</div>
          <div className="progress-info">
            <div className="progress-label">Очки</div>
            <div className="progress-value">{userProgress.totalPoints}</div>
          </div>
        </div>
        <div className="progress-card">
          <div className="progress-icon">🔥</div>
          <div className="progress-info">
            <div className="progress-label">Серия</div>
            <div className="progress-value">{userProgress.currentStreak} дней</div>
          </div>
        </div>
        <div className="progress-card">
          <div className="progress-icon">📍</div>
          <div className="progress-info">
            <div className="progress-label">Посещено</div>
            <div className="progress-value">{userProgress.visitedAttractions.length}</div>
          </div>
        </div>
      </div>

      <div className="rewards-section">
        <h2 className="section-title">Разблокированные ({unlockedRewards.length})</h2>
        <div className="rewards-grid">
          {unlockedRewards.map((reward) => (
            <div
              key={reward.id}
              className={`reward-card unlocked ${selectedReward?.id === reward.id ? 'selected' : ''}`}
              onClick={() => handleRewardClick(reward)}
            >
              <div className="reward-icon">{reward.icon}</div>
              <div className="reward-info">
                <h3 className="reward-name">{reward.name}</h3>
                <p className="reward-description">{reward.description}</p>
                <div className="reward-points">+{reward.points} очков</div>
              </div>
              <div className="reward-status">✓</div>
            </div>
          ))}
        </div>
      </div>

      {lockedRewards.length > 0 && (
        <div className="rewards-section">
          <h2 className="section-title">Доступно для разблокировки ({lockedRewards.length})</h2>
          <div className="rewards-grid">
            {lockedRewards.map((reward) => (
              <div
                key={reward.id}
                className="reward-card locked"
              >
                <div className="reward-icon locked-icon">{reward.icon}</div>
                <div className="reward-info">
                  <h3 className="reward-name">{reward.name}</h3>
                  <p className="reward-description">{reward.description}</p>
                  <div className="reward-points">+{reward.points} очков</div>
                </div>
                <div className="reward-status">🔒</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedReward && (
        <div className="reward-modal-overlay" onClick={handleCloseModal}>
          <div className="reward-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={handleCloseModal}>
              ×
            </button>
            <div className="modal-icon">{selectedReward.icon}</div>
            <h2 className="modal-title">{selectedReward.name}</h2>
            <p className="modal-description">{selectedReward.description}</p>
            <div className="modal-points">+{selectedReward.points} очков</div>
            {selectedReward.unlockedAt && (
              <div className="modal-unlocked-at">
                Получено: {new Date(selectedReward.unlockedAt).toLocaleDateString('ru-RU')}
              </div>
            )}
            <button className="modal-button" onClick={handleCloseModal}>
              Отлично!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
