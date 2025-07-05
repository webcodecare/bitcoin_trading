import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import TradingViewChart from "@/components/charts/TradingViewChart";
import HeatmapChart from "@/components/charts/HeatmapChart";
import CycleChart from "@/components/charts/CycleChart";
import MarketWidget from "@/components/widgets/MarketWidget";
import { 
  Bitcoin, 
  TrendingUp, 
  Shield, 
  Zap, 
  Star,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  BarChart3
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Real-time Signals",
      description: "Get instant buy/sell alerts from our advanced algorithms",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "200-week heatmaps and cycle forecasting tools",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Professional Grade",
      description: "Enterprise-level security and reliability",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Real-time data processing and instant notifications",
    },
  ];

  const pricingPlans = [
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
      ],
      buttonText: "Get Started",
      popular: false,
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
      ],
      buttonText: "Upgrade to Pro",
      popular: true,
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
      ],
      buttonText: "Contact Sales",
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "Michael Rodriguez",
      role: "Day Trader",
      content: "The signals have been incredibly accurate. I've increased my portfolio by 150% in 6 months using their strategy.",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      role: "Crypto Investor",
      content: "The cycle forecaster helped me time the market perfectly. Best investment I've made for my trading.",
      rating: 5,
    },
    {
      name: "David Kumar",
      role: "Portfolio Manager",
      content: "Professional-grade analytics at an affordable price. The heatmap feature alone is worth the subscription.",
      rating: 5,
    },
  ];

  const cryptoSymbols = [
    { symbol: "BTCUSDT", name: "Bitcoin", icon: <Bitcoin className="h-6 w-6 text-orange-500" /> },
    { symbol: "ETHUSDT", name: "Ethereum", icon: <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">E</div> },
    { symbol: "SOLUSDT", name: "Solana", icon: <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div> },
    { symbol: "ADAUSDT", name: "Cardano", icon: <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 crypto-gradient opacity-20"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Professional <span className="text-primary">Crypto</span> Trading Signals
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Advanced Bitcoin analytics with real-time TradingView signals, 200-week heatmaps, and cycle forecasting. Join thousands of traders making data-driven decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="crypto-gradient text-white">
                  <Link href="/auth?mode=register">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">Watch Demo</Link>
                </Button>
              </div>
              
              {/* Track Record Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">87%</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">12,847</div>
                  <div className="text-sm text-muted-foreground">Active Traders</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">+234%</div>
                  <div className="text-sm text-muted-foreground">Avg ROI</div>
                </div>
              </div>
            </div>
            
            {/* Live BTC Chart Preview */}
            <div className="lg:ml-8">
              <TradingViewChart 
                symbol="BTCUSDT"
                height={350}
                showSignals={false}
                className="border-2 border-primary/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose CryptoStrategy Pro?</h2>
            <p className="text-xl text-muted-foreground">Professional tools designed for serious traders</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="text-primary mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Charts Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Advanced Bitcoin Analytics</h2>
            <p className="text-xl text-muted-foreground">Professional-grade charts and indicators for serious traders</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Advanced BTC Chart with Buy/Sell Signals */}
            <TradingViewChart 
              symbol="BTCUSDT"
              height={400}
              showSignals={true}
              className="border border-border"
            />

            {/* 200-Week Heatmap */}
            <HeatmapChart 
              symbol="BTC"
              height={400}
              className="border border-border"
            />
          </div>

          {/* Cycle Forecaster */}
          <CycleChart 
            symbol="BTC"
            height={300}
            className="border border-border"
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Trading Plan</h2>
            <p className="text-xl text-muted-foreground">Professional tools for every level of trader</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative hover:border-primary/50 transition-colors ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-primary mb-2">
                      ${plan.price}<span className="text-base text-muted-foreground">/{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'crypto-gradient text-white' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/auth?mode=register">{plan.buttonText}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trusted by Traders Worldwide</h2>
            <p className="text-xl text-muted-foreground">See what our community is saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-4">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Market Data Widgets */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Live Market Data</h2>
            <p className="text-xl text-muted-foreground">Real-time cryptocurrency prices and market statistics</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cryptoSymbols.map((crypto, index) => (
              <MarketWidget
                key={index}
                symbol={crypto.symbol}
                name={crypto.name}
                icon={crypto.icon}
                className="hover:scale-105 transition-transform"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 crypto-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Transform Your Trading?</h2>
          <p className="text-xl mb-8 text-white/90">Join thousands of traders using our professional analytics platform</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth?mode=register">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary" asChild>
              <Link href="/pricing">Schedule Demo</Link>
            </Button>
          </div>
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
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Award className="h-4 w-4" />
                </Button>
              </div>
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
      <Footer />
    </div>
  );
}
