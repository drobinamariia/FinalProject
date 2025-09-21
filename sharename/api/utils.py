from django.core.cache import cache
from django.utils import timezone
import json


class ExpirationNotifier:
    
    # Notifies specific users that their context expiration has been processed
    @staticmethod
    def notify_expiration_processed(affected_users):
        timestamp = timezone.now().isoformat()
        
        for user_id in affected_users:
            cache_key = f"expiration_notification_{user_id}"
            cache.set(cache_key, {
                'timestamp': timestamp,
                'processed': True
            }, 300)
    
    # Checks if there are any expiration notifications for a specific user
    @staticmethod
    def check_expiration_notifications(user_id):
        cache_key = f"expiration_notification_{user_id}"
        notification = cache.get(cache_key)
        
        if notification:
            cache.delete(cache_key)
            return notification
        
        return None
    
    # Records when a user last checked for notifications
    @staticmethod
    def set_user_last_check(user_id):
        timestamp = timezone.now().isoformat()
        cache_key = f"user_last_check_{user_id}"
        cache.set(cache_key, timestamp, 3600)
    
    # Gets the timestamp of when a user last checked for notifications
    @staticmethod
    def get_user_last_check(user_id):
        cache_key = f"user_last_check_{user_id}"
        return cache.get(cache_key)