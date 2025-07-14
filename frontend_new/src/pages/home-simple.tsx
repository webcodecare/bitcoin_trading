import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HomeSimple() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full"></div>
              <span className="text-xl font-bold">CryptoStrategy Pro</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Professional Bitcoin
            <br />
            <span className="text-primary">Trading Signals</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Advanced cryptocurrency analytics with real-time signals, 200-week heatmaps, 
            and cycle forecasting. Join thousands of traders making data-driven decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Real-time Signals</h3>
              <p className="text-muted-foreground">
                Get instant buy/sell alerts from our advanced algorithms
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                200-week heatmaps and cycle forecasting tools
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Professional Grade</h3>
              <p className="text-muted-foreground">
                Enterprise-level security and reliability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-muted-foreground">Active Traders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">28</div>
              <div className="text-muted-foreground">Crypto Pairs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Live Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of traders using our professional signals
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 CryptoStrategy Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}