import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { ChevronRight, Ruler, Weight, User as UserIcon, Calendar, Check } from 'lucide-react';
import clsx from 'clsx';

const steps = [
  { id: 'welcome', title: "Beat the Sugar Spike", subtitle: "Track. Understand. Change." },
  { id: 'age', title: "How old are you?", icon: Calendar, field: 'age', min: 10, max: 100, unit: 'years' },
  { id: 'gender', title: "What's your gender?", icon: UserIcon, field: 'gender', options: ['Male', 'Female', 'Other'] }, // Simplified for quick prototype
  { id: 'height', title: "How tall are you?", icon: Ruler, field: 'height', min: 100, max: 250, unit: 'cm' },
  { id: 'weight', title: "How much do you weigh?", icon: Weight, field: 'weight', min: 30, max: 200, unit: 'kg' },
];

const Onboarding = () => {
  const { signup } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    age: 25,
    gender: 'Male',
    height: 170,
    weight: 70
  });

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit
      await signup(formData);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const stepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-8"
          >
            {stepData.id === 'welcome' ? (
                <div className="text-center space-y-6 mt-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Beat the Sugar Spike
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Real-time feedback for your sugar habits. <br/>
                        No signup. No judgment.
                    </p>
                    <div className="pt-8">
                        <button 
                            onClick={handleNext}
                            className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-center space-y-2">
                        {stepData.icon && <stepData.icon className="w-12 h-12 mx-auto text-purple-400 mb-4" />}
                        <h2 className="text-3xl font-bold">{stepData.title}</h2>
                    </div>

                    <div className="w-full px-4">
                        {stepData.field === 'gender' ? (
                            <div className="grid grid-cols-1 gap-4">
                                {stepData.options.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => updateField('gender', opt)}
                                        className={clsx(
                                            "p-4 rounded-xl border transition-all text-left text-lg font-medium",
                                            formData.gender === opt 
                                                ? "border-purple-500 bg-purple-500/10 text-white" 
                                                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                                        )}
                                    >
                                        {opt}
                                        {formData.gender === opt && <Check className="inline ml-2 w-5 h-5" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center text-5xl font-bold text-purple-400">
                                    {formData[stepData.field]}
                                    <span className="text-xl text-zinc-500 ml-2">{stepData.unit}</span>
                                </div>
                                <input
                                    type="range"
                                    min={stepData.min}
                                    max={stepData.max}
                                    value={formData[stepData.field]}
                                    onChange={(e) => updateField(stepData.field, parseInt(e.target.value))}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="w-full pt-8 flex justify-between items-center px-4">
                        <div className="flex space-x-1">
                            {steps.slice(1).map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={clsx(
                                        "w-2 h-2 rounded-full transition-colors",
                                        idx < currentStep ? "bg-purple-500" : "bg-zinc-800"
                                    )}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
