import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Target, TrendingUp } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  iconType: string;
  pointsReward: number;
  isUnlocked?: boolean;
  unlockedAt?: string;
  progress?: number;
}

interface UserStats {
  signalsReceived: number;
  daysActive: number;
  profitPercentage: number;
  totalPoints: number;
}

export default function AchievementsPage() {
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/achievements'],
  });

  const { data: userAchievements = [], isLoading: userAchievementsLoading } = useQuery({
    queryKey: ['/api/user/achievements'],
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/stats'],
  });

  // Merge achievements with user progress
  const mergedAchievements = achievements.map((achievement: Achievement) => {
    const userAchievement = userAchievements.find((ua: any) => ua.achievementId === achievement.id);
    return {
      ...achievement,
      isUnlocked: !!userAchievement,
      unlockedAt: userAchievement?.unlockedAt,
      progress: userAchievement?.progress || 0,
    };
  });

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'trophy':
        return <Trophy className="h-6 w-6" />;
      case 'award':
        return <Award className="h-6 w-6" />;
      case 'target':
        return <Target className="h-6 w-6" />;
      case 'trending':
        return <TrendingUp className="h-6 w-6" />;
      default:
        return <Trophy className="h-6 w-6" />;
    }
  };

  const calculateProgress = (achievement: Achievement, stats: UserStats) => {
    if (achievement.isUnlocked) return 100;
    
    switch (achievement.id) {
      case 'first-signal':
        return Math.min(100, (stats?.signalsReceived || 0) / 1 * 100);
      case 'signal-veteran':
        return Math.min(100, (stats?.signalsReceived || 0) / 100 * 100);
      case 'signal-master':
        return Math.min(100, (stats?.signalsReceived || 0) / 1000 * 100);
      case 'early-adopter':
        return Math.min(100, (stats?.daysActive || 0) / 7 * 100);
      case 'consistent-trader':
        return Math.min(100, (stats?.daysActive || 0) / 30 * 100);
      case 'profitable-trader':
        return Math.min(100, (stats?.profitPercentage || 0) / 10 * 100);
      case 'platform-explorer':
        return Math.min(100, (stats?.daysActive || 0) / 1 * 100);
      case 'loyal-user':
        return Math.min(100, (stats?.daysActive || 0) / 90 * 100);
      default:
        return 0;
    }
  };

  if (achievementsLoading || userAchievementsLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Track your progress and unlock rewards</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const unlockedCount = mergedAchievements.filter(a => a.isUnlocked).length;
  const totalPoints = userStats?.totalPoints || 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">Track your progress and unlock rewards</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">{unlockedCount}/{achievements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Signals Received</p>
                <p className="text-2xl font-bold">{userStats?.signalsReceived || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Days Active</p>
                <p className="text-2xl font-bold">{userStats?.daysActive || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mergedAchievements.map((achievement: Achievement) => {
          const progress = calculateProgress(achievement, userStats);
          
          return (
            <Card key={achievement.id} className={`transition-all duration-200 ${
              achievement.isUnlocked 
                ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                : 'hover:shadow-md'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      achievement.isUnlocked 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {getIconComponent(achievement.iconType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {achievement.isUnlocked && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Unlocked
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {achievement.pointsReward} points
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-green-600">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}