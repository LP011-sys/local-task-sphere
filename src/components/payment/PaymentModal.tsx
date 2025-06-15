
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCreatePayment } from "@/hooks/usePayments";
import { supabase } from "@/integrations/supabase/client";

// Props for showing payment details and handling Stripe payment
export function PaymentModal({
  open,
  onOpenChange,
  taskId,
  customerId,
  providerId,
  amountTotal,
  onPaymentComplete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  taskId: string;
  customerId: string;
  providerId: string;
  amountTotal: number;
  onPaymentComplete?: () => void;
}) {
  const platformFee = Math.round(amountTotal * 0.2 * 100) / 100;
  const providerAmount = Math.round(amountTotal * 0.8 * 100) / 100;
  const [isPaying, setIsPaying] = useState(false);
  const createPayment = useCreatePayment();

  async function handleStripePayment() {
    setIsPaying(true);
    try {
      // Here you would call a Supabase Edge Function for Stripe Checkout session creation - this is a stub.
      // Replace this with your actual Edge Function call:
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: amountTotal,
          task_id: taskId,
          customer_id: customerId,
          provider_id: providerId,
        },
      });
      if (error) throw error;
      // Insert payment as pending/paid based on Stripe session - here we mark "paid" optimistically.
      await createPayment.mutateAsync({
        task_id: taskId,
        customer_id: customerId,
        provider_id: providerId,
        amount_total: amountTotal,
        amount_platform_fee: platformFee,
        amount_provider: providerAmount,
        status: "paid",
      });
      window.open(data.url, "_blank");
      toast({ title: "Redirected to Stripe!", description: "Complete payment in the opened tab." });
      onOpenChange(false);
      if (onPaymentComplete) onPaymentComplete();
    } catch (err: any) {
      toast({ title: "Payment error", description: String(err?.message || err) });
    } finally {
      setIsPaying(false);
    }
  }

  async function handleSkip() {
    await createPayment.mutateAsync({
      task_id: taskId,
      customer_id: customerId,
      provider_id: providerId,
      amount_total: amountTotal,
      amount_platform_fee: platformFee,
      amount_provider: providerAmount,
      status: "pending",
    });
    toast({
      title: "Marked as to be paid after task.",
      description: "Pay the provider after completion.",
    });
    onOpenChange(false);
    if (onPaymentComplete) onPaymentComplete();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Payment</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <div className="text-lg font-semibold mb-2">Payment details:</div>
          <div className="flex flex-col gap-1 mb-2">
            <span>Customer pays <span className="font-bold text-primary">€{amountTotal.toFixed(2)}</span></span>
            <span>Platform fee: <span className="text-destructive">€{platformFee.toFixed(2)}</span> (20%)</span>
            <span>Provider receives: <span className="text-green-600 font-bold">€{providerAmount.toFixed(2)}</span></span>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isPaying} onClick={handleStripePayment} className="flex-1">Pay Upfront with Stripe</Button>
          <Button disabled={isPaying} variant="outline" onClick={handleSkip} className="flex-1">Skip / Pay Later</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
