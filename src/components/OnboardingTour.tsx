import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Layout, BarChart3, Users, Package, ShoppingCart, Settings, Zap } from 'lucide-react';
import { getCurrentUser, updateUserProfile } from '../lib/supabaseAuth';

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  features: string[];
  layout: 'compact' | 'detailed' | 'analytics';
}

const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'compact',
    name: 'Compact Dashboard',
    description: 'Clean and minimal design perfect for quick overview',
    icon: Layout,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    features: ['Essential metrics only', 'Quick actions', 'Mobile-friendly', 'Fast loading'],
    layout: 'compact'
  },
  {
    id: 'detailed',
    name: 'Detailed Dashboard',
    description: 'Comprehensive view with all features and insights',
    icon: BarChart3,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    features: ['Full analytics', 'Advanced charts', 'Detailed reports', 'Complete overview'],
    layout: 'detailed'
  },
  {
    id: 'analytics',
    name: 'Analytics Focus',
    description: 'Data-driven dashboard optimized for business insights',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    features: ['Advanced analytics', 'Trend analysis', 'Performance metrics', 'Business intelligence'],
    layout: 'analytics'
  }
];

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Organica AI! 🎉',
    content: 'Let\'s get you set up with your personalized dashboard. This will only take a few minutes.',
    icon: Sparkles,
    showTemplateSelection: false
  },
  {
    id: 'template',
    title: 'Choose Your Dashboard Style',
    content: 'Select a dashboard template that matches your workflow and preferences.',
    icon: Layout,
    showTemplateSelection: true
  },
  {
    id: 'features',
    title: 'Key Features Overview',
    content: 'Here are the main features you\'ll use to manage your organic store.',
    icon: Settings,
    showTemplateSelection: false
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    content: 'Your dashboard is ready. You can always change your preferences later in settings.',
    icon: Check,
    showTemplateSelection: false
  }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onComplete, onSkip }) => {
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('detailed');
  const [isLoading, setIsLoading] = useState(false);

  // Load user data
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const currentTourStep = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update user profile with selected template and mark as onboarded
      await updateUserProfile({
        is_onboarded: true,
        store_type: 'organic_store',
        business_size: 'small'
      });

      // Store template preference in localStorage for immediate use
      localStorage.setItem('dashboard_template', selectedTemplate);
      localStorage.setItem('organica_onboarded', 'true');

      onComplete();
    } catch (error) {
      // Error completing onboarding - user can retry
      // Still complete the tour even if there's an error
      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Set default template and mark as onboarded
    localStorage.setItem('dashboard_template', 'detailed');
    localStorage.setItem('organica_onboarded', 'true');
    onSkip();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <currentTourStep.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentTourStep.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {tourSteps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentTourStep.showTemplateSelection ? (
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
                {currentTourStep.content}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dashboardTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {selectedTemplate === template.id && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className={`w-16 h-16 ${template.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className={`w-8 h-8 ${template.color}`} />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {template.name}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {template.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {template.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentStep === 2 ? (
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
                {currentTourStep.content}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Package, name: 'Inventory', description: 'Manage products and stock' },
                  { icon: Users, name: 'Customers', description: 'Track customer relationships' },
                  { icon: ShoppingCart, name: 'Sales', description: 'Process orders and payments' },
                  { icon: BarChart3, name: 'Analytics', description: 'View business insights' }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="text-center p-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <currentTourStep.icon className="w-12 h-12 text-primary" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
                {currentTourStep.content}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {currentStep === tourSteps.length - 1 ? 'Complete' : 'Next'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
