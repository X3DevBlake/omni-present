import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeedbackForm({ onSuccess, featureName = null }) {
  const [formData, setFormData] = useState({
    feedback_type: 'general_feedback',
    feature_name: featureName || '',
    rating: 0,
    title: '',
    description: '',
    page_url: window.location.href,
    user_agent: navigator.userAgent,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const analyzeSentiment = async (text) => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the sentiment and extract key information from this user feedback:

"${text}"

Determine:
1. Sentiment: positive, neutral, or negative
2. Priority: low, medium, high, or critical (based on urgency and impact)
3. Key tags: extract 3-5 relevant tags/topics
4. Sentiment confidence score (0-100)

Respond with a JSON object.`,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
            priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
            tags: { type: "array", items: { type: "string" } },
            sentiment_score: { type: "number" }
          }
        }
      });
      return result;
    } catch (error) {
      return {
        sentiment: "neutral",
        priority: "medium",
        tags: [],
        sentiment_score: 50
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const analysis = await analyzeSentiment(formData.description);
    
    await base44.entities.Feedback.create({
      ...formData,
      sentiment: analysis.sentiment,
      sentiment_score: analysis.sentiment_score,
      tags: analysis.tags,
      priority: analysis.priority,
    });

    setSuccess(true);
    setTimeout(() => {
      onSuccess?.();
      setSuccess(false);
      setFormData({
        feedback_type: 'general_feedback',
        feature_name: '',
        rating: 0,
        title: '',
        description: '',
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      });
    }, 2000);
    
    setLoading(false);
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 flex flex-col items-center justify-center gap-4 min-h-[400px]"
      >
        <CheckCircle2 className="w-20 h-20 text-green-400" />
        <h3 className="text-2xl font-bold text-white">Thank you!</h3>
        <p className="text-white/60 text-center">Your feedback has been received and analyzed.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-2">
        <Label className="text-white">Feedback Type</Label>
        <Select value={formData.feedback_type} onValueChange={(val) => setFormData({...formData, feedback_type: val})}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bug_report">🐛 Bug Report</SelectItem>
            <SelectItem value="feature_request">💡 Feature Request</SelectItem>
            <SelectItem value="feature_rating">⭐ Rate a Feature</SelectItem>
            <SelectItem value="general_feedback">💬 General Feedback</SelectItem>
            <SelectItem value="complaint">😞 Complaint</SelectItem>
            <SelectItem value="praise">🎉 Praise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(formData.feedback_type === 'feature_rating' || formData.feedback_type === 'feature_request') && (
        <div className="space-y-2">
          <Label className="text-white">Feature Name</Label>
          <Input
            value={formData.feature_name}
            onChange={(e) => setFormData({...formData, feature_name: e.target.value})}
            placeholder="Which feature?"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      )}

      {formData.feedback_type === 'feature_rating' && (
        <div className="space-y-2">
          <Label className="text-white">Rating</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({...formData, rating: star})}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-white">Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Brief summary"
          className="bg-white/5 border-white/10 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Tell us more..."
          className="bg-white/5 border-white/10 text-white min-h-[120px]"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing & Submitting...
          </>
        ) : (
          'Submit Feedback'
        )}
      </Button>

      <p className="text-white/40 text-xs text-center">
        Your feedback will be analyzed by AI for sentiment and priority
      </p>
    </form>
  );
}