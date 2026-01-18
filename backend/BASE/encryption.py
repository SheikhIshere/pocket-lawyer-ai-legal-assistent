# security to keep api key encrypted and safe
from cryptography.fernet import Fernet
from django.conf import settings
from django.db import models

# Custom encryption field
class EncryptedTextField(models.TextField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def _get_cipher_suite(self):
        # Get the key at runtime, not during model initialization
        key = getattr(settings, 'CRYPTOGRAPHY_KEY', None)
        if not key:
            # Generate a default key if not set (for development)
            key = 'your-default-encryption-key-change-in-production-32-chars'
        return Fernet(key.encode())
    
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        try:
            cipher_suite = self._get_cipher_suite()
            decrypted = cipher_suite.decrypt(value.encode()).decode()
            return decrypted
        except Exception:
            return value
    
    def to_python(self, value):
        return value
    
    def get_prep_value(self, value):
        if value is None:
            return value
        try:
            cipher_suite = self._get_cipher_suite()
            encrypted = cipher_suite.encrypt(value.encode()).decode()
            return encrypted
        except Exception:
            return value

