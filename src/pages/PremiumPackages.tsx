
import React, { useState } from "react";
import { Card }  "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Crown, Star, Zap, Shield, Check } from "lucide-react";

type Package = {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
};

const packages: Package[] = [
  {
    id: "basic",
    name: "Basic",
    price: 9.99,
    period: "month",
    description: "Perfect for occasional task posting",
    features: [
      "Post up to 5 tasks per month",
      "Basic customer support",
      "Standard task visibility",
      "Access to all categories"
    ],
    icon: <Star className="text-blue-500" size={24} />,
    color: "border-blue-200"
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    period: "month",
    description: "Great for regular users and small businesses",
    features: [
      "Unlimited task posting",
      "Priority customer support",
      "Enhanced task visibility",
      "Advanced filtering options",
      "Task analytics dashboard",
      "Custom task templates"
    ],
    popular: true,
    icon: <Crown className="text-yellow-500" size={24} />,
    color: "border-yellow-300"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 49.99,
    period: "month",
    description: "For businesses with high-volume needs",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting",
      "Team collaboration tools",
      "SLA guarantees",
      "White-label options"
    ],
    icon: <Shield className="text-purple-500" size={24} />,
    color: "border-purple-200"
  }
];

export default function PremiumPackages() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (packageId: string) => {
    setLoading(true);
    setSelectedPackage(packageId);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({ 
        title: "Subscription successful!", 
        description: `You've successfully subscribed to the ${packages.find(p => p.id === packageId)?.name} plan.`
      });
    } catch (error) {
      toast({ 
        title: "Subscription failed", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="text-center bg-white rounded-xl shadow-md p-6 border">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="text-primary" size={32} />
          <h1 className="text-2xl font-bold">Premium Plans</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of Task Hub with our premium plans. 
          Get more visibility, advanced features, and priority support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-xl shadow-md border-2 ${pkg.color} ${
              pkg.popular ? "ring-2 ring-yellow-400 ring-offset-2" : ""
            } relative overflow-hidden`}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {pkg.icon}
                <div>
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  <p className="text-xs text-muted-foreground">{pkg.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">€{pkg.price}</span>
                  <span className="text-muted-foreground">/{pkg.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(pkg.id)}
                disabled={loading}
                className={`w-full min-w-[120px] ${
                  pkg.popular 
                    ? "bg-yellow-500 text-white hover:bg-yellow-600" 
                    : "bg-primary text-white hover:bg-primary/90"
                } px-4 py-2 rounded-md`}
              >
                {loading && selectedPackage === pkg.id ? "Processing..." : "Subscribe Now"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Do you offer refunds?</h3>
            <p className="text-sm text-muted-foreground">
              We offer a 30-day money-back guarantee for all premium plans if you're not satisfied.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Can I upgrade or downgrade?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can change your plan at any time. Changes will be prorated based on your billing cycle.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
