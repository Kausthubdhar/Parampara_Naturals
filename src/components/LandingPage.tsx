import React from 'react';
import { Store, Sun, Moon, CheckCircle, BarChart3, Users, Package, TrendingUp, Shield, Zap, Smartphone, Globe, Lock, Award } from 'lucide-react';
import SupabaseAuth from './auth/SupabaseAuth';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  console.log('LandingPage rendering, theme:', theme);

  const features = [
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'AI-powered insights to grow your business',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Automated stock tracking and alerts',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Users,
      title: 'Customer Insights',
      description: 'Build lasting relationships with data',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Revenue Growth',
      description: 'Maximize profits with smart strategies',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const benefits = [
    { icon: Zap, text: 'Quick Setup' },
    { icon: Shield, text: 'Secure' },
    { icon: Smartphone, text: 'Mobile Ready' },
    { icon: Globe, text: 'Cloud Based' },
    { icon: Lock, text: 'Private' },
    { icon: Award, text: 'Trusted' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 dark:bg-blue-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-200/20 dark:bg-indigo-400/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-200/10 dark:bg-cyan-400/5 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-sm">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Organica AI
              </h1>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                Manage Your
                <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Organic Store
                </span>
                with AI
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                The intelligent platform for organic store owners. Track inventory, 
                analyze sales, and grow your business with AI-powered insights.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8">
                <div className="text-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Store className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Sign in to your account
                  </p>
                </div>

                {/* Supabase Auth Component */}
                <SupabaseAuth />

                <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Trusted by organic stores worldwide</p>
                    <div className="flex justify-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-300">Secure</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-300">Fast</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-300">Reliable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Powerful features designed specifically for organic store management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300"
              >
                <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-lg w-fit mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-16 py-8 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              Organica AI
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © 2024 Organica AI. Empowering organic store owners.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
