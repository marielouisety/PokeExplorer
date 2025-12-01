import { Alert } from 'react-native';

class NotificationService {
  showPokemonNearbyNotification(pokemonName: string) {
    Alert.alert(
      'Pokemon Nearby!',
      `A wild ${pokemonName} has appeared nearby!`,
      [{ text: 'OK' }]
    );
  }

  showDailyReminderNotification() {
    Alert.alert(
      'Daily Pokemon Hunt',
      'Don\'t forget to hunt for Pokemon today!',
      [{ text: 'OK' }]
    );
  }

  scheduleDailyReminder() {
    console.log('Daily reminder scheduled');
  }

  cancelAllNotifications() {
    console.log('All notifications cancelled');
  }
}

export const notificationService = new NotificationService();