import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/layout/Navigation";
import { 
  CheckCircle, 
  Bitcoin,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Bell,
  Smartphone,
  Users,
  Crown,
  Star,
  ArrowRight
} from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: 29,
      period: "month",
      description: "Perfect for beginners",
      features: [
        "Basic trading signals",
        "Email alerts",
        "Basic charts",
        "Mobile access",
        "Community support",
        "Weekly market insights",
      ],
      buttonText: "Get Started",
      popular: false,
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      name: "Pro",
      price: 79,
      period: "month",
      description: "For serious traders",
      features: [
        "Advanced trading signals",
        "Email + SMS alerts",
        "All chart types",
        "200-week heatmap",
        "Cycle forecaster",
        "API access",
        "Priority support",
        "Daily market analysis",
        "Custom indicators",
        "Portfolio tracking",
      ],
      buttonText: "Upgrade to Pro",
      popular: true,
      icon: BarChart3,
      color: "text-primary",
    },
    {
      name: "Enterprise",
      price: 199,
      period: "month",
      description: "For institutions",
      features: [
        "Everything in Pro",
        "Custom indicators",
        "Priority support",
        "White-label options",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced analytics",
        "Team collaboration",
        "SLA guarantee",
        "Custom training",
      ],
      buttonText: "Contact Sales",
      popular: false,
      icon: Crown,
      color: "text-emerald-500",
    },
  ];

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Real-time Signals",
      description: "Get instant buy/sell alerts powered by advanced algorithms",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "200-week heatmaps and cycle forecasting tools",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-level security with encrypted data transmission",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Real-time data processing with sub-second latency",
    },
  ];

  const faqs = [
    {
      question: "How accurate are the trading signals?",
      answer: "Our signals have maintained an 87% accuracy rate over the past 12 months, based on historical performance data.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. There are no long-term commitments or cancellation fees.",
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes, all plans come with a 14-day free trial. No credit card required to start.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and cryptocurrency payments including Bitcoin and Ethereum.",
    },
    {
      question: "Is there customer support available?",
      answer: "Yes, we provide 24/7 customer support via email, chat, and phone for Pro and Enterprise customers.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Absolutely! You can change your plan at any time from your account settings. Changes take effect immediately.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Choose Your <span className="text-primary">Trading</span> Plan
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Professional cryptocurrency analytics and trading signals for every level of trader. Start with a 14-day free trial.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={index} 
                  className={`relative hover:border-primary/50 transition-all duration-300 ${
                    plan.popular ? 'border-primary shadow-lg scale-105 bg-card/80 backdrop-blur' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="crypto-gradient text-white px-6 py-2 text-sm font-semibold">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto mb-4 p-3 rounded-full bg-muted ${plan.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-primary mb-2">
                      ${plan.price}
                      <span className="text-base text-muted-foreground font-normal">/{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-emerald-400 mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.popular ? 'crypto-gradient text-white' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      asChild
                    >
                      <Link href="/auth?mode=register">
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose CryptoStrategy Pro?</h2>
            <p className="text-xl text-muted-foreground">Professional tools trusted by thousands of traders worldwide</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="text-primary mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Traders Worldwide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">12,847</div>
                <div className="text-muted-foreground">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-400 mb-2">87%</div>
                <div className="text-muted-foreground">Signal Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-400 mb-2">+234%</div>
                <div className="text-muted-foreground">Average ROI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about our platform</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 crypto-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Start Trading Smarter?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of successful traders using our professional analytics platform
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth?mode=register">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-primary"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-white/70 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 text-2xl font-bold text-primary mb-4">
                <Bitcoin className="h-8 w-8" />
                <span>CryptoStrategy Pro</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Professional cryptocurrency trading signals and analytics for serious traders.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/auth" className="hover:text-foreground transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 CryptoStrategy Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
