import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Float, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, CheckCircle2, Clock, AlertCircle, X, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as THREE from 'three';

const AssignmentNode = ({ assignment, position, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.5 : hovered ? 1.25 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
      meshRef.current.rotation.y = state.clock.elapsedTime * (isSelected ? 2 : 0.5);
    }
  });

  const statusColors = {
    completed: '#10b981',
    submitted: '#3b82f6',
    pending: '#f59e0b',
    overdue: '#ef4444'
  };
  
  const status = assignment.submitted ? 'submitted' : assignment.overdue ? 'overdue' : 'pending';
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.6}>
        <Sphere 
          ref={meshRef}
          args={[0.35, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(assignment);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <meshPhysicalMaterial
            color={statusColors[status]}
            emissive={statusColors[status]}
            emissiveIntensity={isSelected ? 2 : hovered ? 1.4 : 0.9}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
        
        {(hovered || isSelected) && (
          <Html distanceFactor={8}>
            <div className="bg-black/95 border-2 border-purple-400 rounded-xl p-4 min-w-[240px] backdrop-blur-xl">
              <div className="text-purple-400 font-bold text-sm mb-2">{assignment.title}</div>
              <div className="text-gray-400 text-xs mb-3">{assignment.course_name}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Status:</span>
                  <Badge className={`bg-${status === 'completed' ? 'green' : status === 'submitted' ? 'blue' : status === 'overdue' ? 'red' : 'amber'}-600`}>
                    {status}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Due Date:</span>
                  <span className="text-white">{assignment.due_date}</span>
                </div>
                {assignment.grade && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Grade:</span>
                    <span className="text-green-400 font-bold">{assignment.grade}%</span>
                  </div>
                )}
              </div>
            </div>
          </Html>
        )}
      </Float>
      
      <Text position={[0, -0.6, 0]} fontSize={0.1} color="white" anchorX="center">
        {assignment.title.split(' ').slice(0, 2).join(' ')}
      </Text>
    </group>
  );
};

export default function InteractiveAssignmentHub3D() {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', user?.email],
    queryFn: async () => {
      const data = await base44.entities.Assignment.filter({ user_email: user?.email });
      return data;
    },
    enabled: !!user
  });

  const sampleAssignments = assignments.length > 0 ? assignments : [
    { id: 1, title: 'Neural Network Lab', course_name: 'Deep Learning', due_date: '2026-02-01', submitted: false, overdue: false },
    { id: 2, title: 'Quantum Circuit Design', course_name: 'Quantum Computing', due_date: '2026-01-28', submitted: true, grade: 92 },
    { id: 3, title: 'IIT 4.0 Analysis', course_name: 'Consciousness Theory', due_date: '2026-02-05', submitted: false, overdue: false },
    { id: 4, title: 'BCI Protocol Paper', course_name: 'Neural Engineering', due_date: '2026-01-20', submitted: false, overdue: true },
    { id: 5, title: 'Hologram Physics', course_name: 'POT Systems', due_date: '2026-02-10', submitted: false, overdue: false },
    { id: 6, title: 'CRDT Implementation', course_name: 'Distributed Systems', due_date: '2026-01-30', submitted: true, grade: 88 }
  ];

  const assignmentPositions = sampleAssignments.slice(0, 8).map((assignment, idx) => {
    const angle = (idx / 8) * Math.PI * 2;
    const radius = 4;
    return {
      assignment,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 1.5, Math.sin(angle) * radius]
    };
  });

  const submitAssignmentMutation = useMutation({
    mutationFn: async (submissionData) => {
      const response = await base44.functions.invoke('submitAssignment', submissionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setSelectedAssignment(null);
      setSubmissionText('');
    }
  });

  const handleSubmit = async () => {
    if (!selectedAssignment || !submissionText) return;
    
    await submitAssignmentMutation.mutateAsync({
      assignment_id: selectedAssignment.id,
      user_email: user?.email,
      content: submissionText,
      submitted_at: new Date().toISOString()
    });
  };

  const pendingCount = sampleAssignments.filter(a => !a.submitted && !a.overdue).length;
  const submittedCount = sampleAssignments.filter(a => a.submitted).length;
  const overdueCount = sampleAssignments.filter(a => a.overdue).length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-950/90 via-indigo-950/90 to-blue-950/90 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-purple-400" />
            Interactive Assignment Universe
          </CardTitle>
          <p className="text-gray-300 text-sm mt-2">Click assignments to submit or review</p>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20">
            <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
              <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />

              {/* Central hub */}
              <Float speed={1} rotationIntensity={0.3}>
                <Sphere args={[0.6, 64, 64]} position={[0, 0, 0]}>
                  <meshPhysicalMaterial
                    color="#ec4899"
                    emissive="#ec4899"
                    emissiveIntensity={1.3}
                    metalness={0.9}
                    roughness={0.1}
                  />
                </Sphere>
                <Text position={[0, 1, 0]} fontSize={0.2} color="#ec4899" anchorX="center">
                  Assignments
                </Text>
              </Float>

              {assignmentPositions.map(({ assignment, position }, idx) => (
                <React.Fragment key={assignment.id}>
                  <AssignmentNode
                    assignment={assignment}
                    position={position}
                    onClick={setSelectedAssignment}
                    isSelected={selectedAssignment?.id === assignment.id}
                  />
                  
                  <Line
                    points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(...position)]}
                    color={selectedAssignment?.id === assignment.id ? '#ec4899' : '#3b82f6'}
                    lineWidth={selectedAssignment?.id === assignment.id ? 2 : 1}
                    transparent
                    opacity={0.4}
                  />
                </React.Fragment>
              ))}

              <OrbitControls enableZoom autoRotate autoRotateSpeed={0.6} />
            </Canvas>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3">
              <Clock className="w-5 h-5 text-amber-400 mb-1" />
              <div className="text-white font-bold text-lg">{pendingCount}</div>
              <div className="text-gray-400 text-xs">Pending</div>
            </div>
            <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 mb-1" />
              <div className="text-white font-bold text-lg">{submittedCount}</div>
              <div className="text-gray-400 text-xs">Submitted</div>
            </div>
            <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-red-400 mb-1" />
              <div className="text-white font-bold text-lg">{overdueCount}</div>
              <div className="text-gray-400 text-xs">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Panel */}
      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="bg-black/90 border-2 border-purple-500/60 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-white font-bold text-2xl mb-1">{selectedAssignment.title}</h3>
                    <p className="text-gray-400">{selectedAssignment.course_name}</p>
                    <Badge className="mt-2 bg-amber-600">Due: {selectedAssignment.due_date}</Badge>
                  </div>
                  <button onClick={() => setSelectedAssignment(null)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {!selectedAssignment.submitted ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Your Submission</label>
                      <Textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Enter your answer or upload files..."
                        className="bg-white/10 border-white/20 text-white h-32"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSubmit}
                        disabled={!submissionText || submitAssignmentMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {submitAssignmentMutation.isPending ? 'Submitting...' : 'Submit Assignment'}
                      </Button>
                      <Button variant="outline" className="border-white/20">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-950/30 border border-green-500/40 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                      <div>
                        <div className="text-white font-bold text-lg">Assignment Submitted</div>
                        <div className="text-gray-400 text-sm">Awaiting review</div>
                      </div>
                    </div>
                    {selectedAssignment.grade && (
                      <div className="bg-black/40 rounded-lg p-4">
                        <div className="text-green-400 text-sm mb-2">Your Grade</div>
                        <div className="text-white text-3xl font-bold">{selectedAssignment.grade}%</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}