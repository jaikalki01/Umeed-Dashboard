import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MembershipPlanCard } from "@/components/admin/MembershipPlanCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const membershipPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    duration: 'Forever',
    description: 'Basic features to get started',
    features: [
      { name: 'Create profile', included: true },
      { name: 'Browse profiles', included: true },
      { name: 'Send 5 messages per day', included: true },
      { name: 'Basic search filters', included: true },
      { name: 'Video calls', included: false },
      { name: 'Audio calls', included: false },
      { name: 'Advanced search', included: false },
      { name: 'Profile verification badge', included: false }
    ]
  },
  {
    id: 'paid',
    name: 'Paid',
    price: '₹999',
    duration: 'Per month',
    description: 'Enhanced features for serious matchmaking',
    isPopular: true,
    features: [
      { name: 'All Free features', included: true },
      { name: 'Unlimited messages', included: true },
      { name: 'Video calls (30 min/day)', included: true },
      { name: 'Audio calls (60 min/day)', included: true },
      { name: 'Advanced search filters', included: true },
      { name: 'See who viewed your profile', included: true },
      { name: 'Priority customer support', included: true },
      { name: 'Profile verification badge', included: false }
    ]
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    price: '₹2,499',
    duration: 'Per month',
    description: 'Premium experience with exclusive benefits',
    features: [
      { name: 'All Paid features', included: true },
      { name: 'Unlimited video calls', included: true },
      { name: 'Unlimited audio calls', included: true },
      { name: 'Profile verification badge', included: true },
      { name: 'Exclusive member events', included: true },
      { name: 'Personal matchmaker assistance', included: true },
      { name: 'Priority profile visibility', included: true },
      { name: '24/7 dedicated support', included: true }
    ]
  }
];

export const MembershipPlans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: "Plan Selected",
      description: `${membershipPlans.find(p => p.id === planId)?.name} plan selected`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Membership Plans</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your matrimonial journey. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {membershipPlans.map((plan) => (
            <MembershipPlanCard
              key={plan.id}
              plan={plan}
              onSelect={handlePlanSelect}
              isSelected={selectedPlan === plan.id}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-muted p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="font-semibold text-foreground mb-2">Need Help Choosing?</h3>
            <p className="text-muted-foreground">
              Our team is here to help you find the perfect plan. Contact support for personalized recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};