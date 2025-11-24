import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useUser } from '../contexts/UserContext';
import { quizQuestions } from '../data/quizQuestions';
import { QuizAnswer } from '../types';
import { CheckCircle, ArrowRight, ArrowLeft, Mic, MicOff } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { updateQuizAnswers, setIsQuizCompleted } = useUser();

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;
  const currentQuestionData = quizQuestions[currentQuestion];

  const handleAnswer = (answer: string | Record<string, any>) => {
    const newAnswer: QuizAnswer = {
      questionId: currentQuestionData.id,
      answer,
      questionText: currentQuestionData.question
    };

    const updatedAnswers = answers.filter(a => a.questionId !== currentQuestionData.id);
    updatedAnswers.push(newAnswer);
    setAnswers(updatedAnswers);
  };

  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAudioRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          setAudioBlob(blob);
          // Here you would send to transcription API
          // For now, we'll just set a placeholder
          handleFormDataChange('audioTranscription', 'Audio recorded - transcription would happen here');
        };

        mediaRecorder.start();
        setIsRecording(true);

        // Stop recording after 60 seconds max
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
          }
        }, 60000);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please check permissions.');
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleNext = () => {
    // For form questions, save form data as answer
    if (currentQuestionData.type === 'contact-form' || currentQuestionData.type === 'business-form') {
      handleAnswer(formData);
    }

    if (isLastQuestion) {
      updateQuizAnswers(answers);
      setIsQuizCompleted(true);
      onComplete();
    } else {
      setCurrentQuestion(prev => prev + 1);
      setFormData({}); // Reset form data for next question
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setFormData({}); // Reset form data when going back
    }
  };

  const getCurrentAnswer = () => {
    return answers.find(a => a.questionId === currentQuestionData.id)?.answer;
  };

  const isAnswered = () => {
    if (currentQuestionData.type === 'multiple-choice') {
      return getCurrentAnswer() !== undefined;
    } else if (currentQuestionData.type === 'contact-form') {
      return formData.email && formData.email.trim() !== '';
    } else if (currentQuestionData.type === 'business-form') {
      return formData.description && formData.description.trim() !== '';
    }
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl automatrix-text-gradient">
            Quick Assessment
          </DialogTitle>
          <DialogDescription className="text-base">
            This quick assessment helps us understand your needs so we can provide 
            the most relevant automation solutions for your business. It takes less than 2 minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {currentQuestionData.question}
              </h3>

              {currentQuestionData.description && (
                <div className="mb-6 text-muted-foreground text-sm leading-relaxed">
                  {currentQuestionData.description.split('\n').map((line, lineIndex) => (
                    <div key={lineIndex} className={lineIndex > 0 ? 'mt-3' : ''}>
                      {line.split('**').map((part, partIndex) =>
                        partIndex % 2 === 1 ? (
                          <strong key={partIndex} className="text-primary font-semibold">{part}</strong>
                        ) : (
                          part
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Multiple Choice Questions */}
              {currentQuestionData.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {currentQuestionData.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 text-left rounded-lg border transition-all hover:border-primary/50 ${
                        getCurrentAnswer() === option
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {getCurrentAnswer() === option && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Contact Form */}
              {currentQuestionData.type === 'contact-form' && (
                <div className="space-y-4">
                  {currentQuestionData.fields?.map((field, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={field.name} className="text-sm font-medium">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id={field.name}
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFormDataChange(field.name, e.target.value)}
                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                        required={field.required}
                        className="bg-background/50 border-white/10"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Business Form */}
              {currentQuestionData.type === 'business-form' && (
                <div className="space-y-6">
                  {/* Business Description with Audio Recording */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Business Description <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => handleFormDataChange('description', e.target.value)}
                        placeholder="Tell us about your business, niche, or what you do..."
                        className="w-full min-h-[120px] p-3 bg-background/50 border border-white/10 rounded-lg resize-none"
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleAudioRecording}
                        className={`absolute bottom-3 right-3 p-2 h-8 w-8 ${
                          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/80'
                        }`}
                        title={isRecording ? 'Stop Recording' : 'Record Audio'}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </div>
                    {audioBlob && (
                      <p className="text-xs text-green-500">✓ Audio recorded successfully</p>
                    )}
                  </div>

                  {/* Social Media URLs */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Social Media & Website (Optional)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {currentQuestionData.fields?.slice(1).map((field, index) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={field.name} className="text-xs text-muted-foreground">
                            {field.label}
                          </Label>
                          <Input
                            id={field.name}
                            type={field.type}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleFormDataChange(field.name, e.target.value)}
                            placeholder={`https://...`}
                            className="bg-background/50 border-white/10 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isAnswered()}
              variant="gradient"
            >
              {isLastQuestion ? 'Complete Assessment' : 'Next Question'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;
