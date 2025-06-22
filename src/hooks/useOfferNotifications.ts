
import { useQueueNotification } from "./useNotificationQueue";

export function useOfferNotifications() {
  const queueNotification = useQueueNotification();

  const sendNewOfferNotification = async (taskOwnerId: string, taskTitle: string, providerName: string) => {
    await queueNotification.mutateAsync({
      userId: taskOwnerId,
      type: 'both',
      eventType: 'new_offer',
      title: 'New Offer Received!',
      content: `${providerName} has submitted an offer for your task "${taskTitle}". Check it out now!`,
      data: { taskTitle, providerName }
    });
  };

  const sendTaskAcceptedNotification = async (providerId: string, taskTitle: string, customerName: string) => {
    await queueNotification.mutateAsync({
      userId: providerId,
      type: 'both',
      eventType: 'task_accepted',
      title: 'Offer Accepted!',
      content: `Great news! ${customerName} has accepted your offer for "${taskTitle}". Time to get started!`,
      data: { taskTitle, customerName }
    });
  };

  return {
    sendNewOfferNotification,
    sendTaskAcceptedNotification
  };
}
