
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, DollarSign, User, CheckCircle, XCircle } from "lucide-react";

type Offer = {
  id: string;
  message: string;
  price: number;
  status: string;
  created_at: string;
  provider_id: string;
  task_id: string;
  task: {
    title: string;
    description: string;
  };
  provider: {
    name: string;
  };
};

export default function CustomerOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from("offers")
        .select(`
          *,
          task:tasks(title, description),
          provider:app_users!offers_provider_id_fkey(name)
        `)
        .eq("task.customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOffers(data || []);
    } catch (error: any) {
      toast({ 
        title: "Failed to load offers", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOfferAction = async (offerId: string, action: "accept" | "reject") => {
    try {
      const { error } = await supabase
        .from("offers")
        .update({ status: action === "accept" ? "accepted" : "rejected" })
        .eq("id", offerId);

      if (error) throw error;

      toast({ 
        title: `Offer ${action}ed successfully!`,
        description: action === "accept" ? "You can now chat with the provider" : undefined
      });
      
      loadOffers();
    } catch (error: any) {
      toast({ 
        title: `Failed to ${action} offer`, 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 border text-center">
          <p className="text-muted-foreground">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border">
        <h1 className="text-xl font-bold mb-4">Offers Received</h1>
        <p className="text-xs text-muted-foreground">
          Review and manage offers from service providers
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 border text-center">
          <p className="text-muted-foreground mb-4">No offers received yet</p>
          <p className="text-xs text-muted-foreground">
            Post a task to start receiving offers from providers
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl shadow-md p-6 border">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="text-primary" size={16} />
                    <span className="text-sm font-medium text-gray-700">
                      {offer.provider?.name || "Provider"}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      offer.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      offer.status === "accepted" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  
                  <h3 className="font-medium mb-2">{offer.task?.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{offer.message}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} />
                      <span>€{offer.price}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{new Date(offer.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {offer.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOfferAction(offer.id, "accept")}
                      className="min-w-[100px] bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md flex items-center gap-1"
                    >
                      <CheckCircle size={16} />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleOfferAction(offer.id, "reject")}
                      variant="outline"
                      className="min-w-[100px] border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md flex items-center gap-1"
                    >
                      <XCircle size={16} />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
