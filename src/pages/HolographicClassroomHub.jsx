import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { 
  Video, Users, BookOpen, Play, Calendar, 
  TrendingUp, Award, Sparkles 
} from 'lucide-react';
import EnhancedHolographicClassroom3D from '../components/academy/EnhancedHolographicClassroom3D';
import CourseViewerEnhanced from '../components/academy/CourseViewerEnhanced';

export default function HolographicClassroomHub() {
  const [activeSession, setActiveSession] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['holographic-sessions'],
    queryFn: () => base44.entities.MultiUserSpatialSession.filter({
      session_type: 'holographic_classroom',
      status: 'active'
    })
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.filter({ is_published: true })
  });

  const { data: myProgress = [] } = useQuery({
    queryKey: ['my-progress', user?.id],
    queryFn: () => base44.entities.TrainingProgress.filter({ user_id: user?.id }),
    enabled: !!user
  });

  const createSessionMutation = useMutation({
    mutationFn: async (courseId) => {
      return await base44.functions.invoke('holographicSessionOrchestrator', {
        action: 'create_holographic_session',
        course_id: courseId,
        module_id: 'intro_module',
        participant_ids: [user.id]
      });
    },
    onSuccess: (response) => {
      setActiveSession(response.data.session);
      queryClient.invalidateQueries({ queryKey: ['holographic-sessions'] });
    }
  });

  if (activeSession) {
    return (
      <div className="fixed inset-0 z-50">
        <EnhancedHolographicClassroom3D
          sessionId={activeSession.session_id}
          courseId={activeSession.environment_config.course_id}
          moduleId={activeSession.environment_config.module_id}
        />
        <Button
          onClick={() => setActiveSession(null)}
          className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700"
        >
          Exit Session
        </Button>
      </div>
    );
  }

  if (selectedCourseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => setSelectedCourseId(null)}
            className="mb-6 bg-gray-700 hover:bg-gray-600"
          >
            ← Back to Courses
          </Button>
          <CourseViewerEnhanced courseId={selectedCourseId} userId={user?.id} />
        </div>
      </div>
    );
  }

  const completedCourses = myProgress.filter(p => p.completed).length;
  const avgEngagement = myProgress.length > 0 
    ? myProgress.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / myProgress.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Holographic Classroom Hub
          </h1>
          <p className="text-xl text-gray-300">
            Immersive 3D Learning Experiences
          </p>
        </motion.div>

        {/* Stats */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{myProgress.length}</div>
                <div className="text-sm text-gray-400">Modules Started</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="pt-6 text-center">
                <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{completedCourses}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="pt-6 text-center">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{(avgEngagement * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-400">Avg Engagement</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="pt-6 text-center">
                <Video className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{sessions.length}</div>
                <div className="text-sm text-gray-400">Live Sessions</div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Live Sessions */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Video className="w-6 h-6 text-green-400" />
                  Live Holographic Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="bg-black/40 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-bold">{session.session_name}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className="bg-green-500">Live</Badge>
                          <span className="text-gray-400 text-sm flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {session.participant_ids?.length || 0} participants
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setActiveSession(session)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Available Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                Available Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="bg-black/40 border-white/10">
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-white mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-400 mb-4">{course.description}</p>
                      <div className="flex gap-2 mb-4">
                        <Badge className="bg-purple-500 text-xs">{course.academic_level}</Badge>
                        <Badge variant="outline" className="border-blue-500/50 text-blue-300 text-xs">
                          {course.duration_weeks} weeks
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedCourseId(course.course_id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          View Course
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => createSessionMutation.mutate(course.course_id)}
                          disabled={createSessionMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Video className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}