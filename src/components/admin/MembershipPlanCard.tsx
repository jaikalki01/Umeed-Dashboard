import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Users, Check } from "lucide-react";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface MembershipPlan {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: PlanFeature[];
  isPopular?: boolean;
  description: string;
}

interface MembershipPlanCardProps {
  plan: MembershipPlan;
  onSelect: (planId: string) => void;
  isSelected?: boolean;
}

export const MembershipPlanCard = ({ plan, onSelect, isSelected }: MembershipPlanCardProps) => {
  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return <Users className="h-6 w-6" />;
      case 'paid': return <Zap className="h-6 w-6" />;
      case 'exclusive': return <Crown className="h-6 w-6" />;
      default: return <Users className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return 'text-muted-foreground';
      case 'paid': return 'text-info';
      case 'exclusive': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-primary shadow-lg' : ''
    } ${plan.isPopular ? 'border-primary' : ''}`}>
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className={`mx-auto mb-3 ${getPlanColor(plan.name)}`}>
          {getPlanIcon(plan.name)}
        </div>
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <div className="space-y-1">
          <div className="text-3xl font-bold text-foreground">{plan.price}</div>
          <div className="text-sm text-muted-foreground">{plan.duration}</div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`rounded-full p-1 ${
                feature.included 
                  ? 'bg-success text-success-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <Check className="h-3 w-3" />
              </div>
              <span className={`text-sm ${
                feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
              }`}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>

        <Button 
          className="w-full" 
          variant={isSelected ? "default" : "outline"}
          onClick={() => onSelect(plan.id)}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};