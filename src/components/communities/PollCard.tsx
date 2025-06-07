
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PollData {
  type: 'poll';
  question: string;
  options: string[];
  description?: string;
  votes: Record<number, number>;
  voters: string[];
}

interface PollCardProps {
  postId: string;
  pollData: PollData;
  authorName: string;
}

const PollCard: React.FC<PollCardProps> = ({ postId, pollData, authorName }) => {
  const { user } = useAuth();
  const [localVotes, setLocalVotes] = useState<Record<number, number>>(pollData.votes || {});
  const [userVote, setUserVote] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (user) {
      const voteKey = `poll_vote_${postId}_${user.id}`;
      const savedVote = localStorage.getItem(voteKey);
      if (savedVote !== null) {
        setUserVote(parseInt(savedVote));
        setHasVoted(true);
      }
    }
  }, [postId, user]);

  const handleVote = (optionIndex: number) => {
    if (!user) {
      toast.error('You must be logged in to vote');
      return;
    }

    if (hasVoted) {
      toast.error('You have already voted on this poll');
      return;
    }

    const voteKey = `poll_vote_${postId}_${user.id}`;
    localStorage.setItem(voteKey, optionIndex.toString());
    
    // Update local vote counts
    setLocalVotes(prev => ({
      ...prev,
      [optionIndex]: (prev[optionIndex] || 0) + 1
    }));
    
    setUserVote(optionIndex);
    setHasVoted(true);
    toast.success('Your vote has been recorded!');
  };

  const totalVotes = Object.values(localVotes).reduce((sum, count) => sum + count, 0);

  const getPercentage = (optionIndex: number) => {
    if (totalVotes === 0) return 0;
    return Math.round(((localVotes[optionIndex] || 0) / totalVotes) * 100);
  };

  const getWinnerIndex = () => {
    if (totalVotes === 0) return null;
    const maxVotes = Math.max(...Object.values(localVotes));
    return Object.entries(localVotes).find(([_, votes]) => votes === maxVotes)?.[0];
  };

  const winnerIndex = getWinnerIndex();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="border-collabCorner-purple text-collabCorner-purple">
          <BarChart3 className="h-3 w-3 mr-1" />
          Poll
        </Badge>
        <span className="text-sm text-muted-foreground">by {authorName}</span>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{pollData.question}</h3>
        
        {pollData.description && (
          <p className="text-muted-foreground">{pollData.description}</p>
        )}

        <div className="space-y-3">
          {pollData.options.map((option, index) => {
            const voteCount = localVotes[index] || 0;
            const percentage = getPercentage(index);
            const isWinner = winnerIndex === index.toString() && totalVotes > 0;
            const isUserChoice = userVote === index;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    {option}
                    {isUserChoice && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {isWinner && <Badge variant="outline" className="text-xs">Winner</Badge>}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage}%)
                  </span>
                </div>
                
                {hasVoted ? (
                  <Progress 
                    value={percentage} 
                    className={`h-3 ${isWinner ? 'bg-green-100' : ''}`}
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote(index)}
                    className="w-full justify-start hover:bg-collabCorner-purple hover:text-white"
                  >
                    {option}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground border-t">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
          </div>
          {hasVoted && (
            <span className="text-green-600 font-medium">✓ You voted</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollCard;
