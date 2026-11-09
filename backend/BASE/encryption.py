# security to keep api key encrypted and safe
from cryptography.fernet import Fernet
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import models

# Custom encryption field
class EncryptedTextField(models.TextField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def _get_cipher_suite(self):
        key = getattr(settings, 'CRYPTOGRAPHY_KEY', None)
        if not key:
            raise ImproperlyConfigured("DJANGO_CRYPTO_KEY is not set")
        try:
            return Fernet(key.encode())
        except Exception as exc:
            raise ImproperlyConfigured(
                "DJANGO_CRYPTO_KEY is not a valid Fernet key"
            ) from exc
    
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        cipher_suite = self._get_cipher_suite()
        return cipher_suite.decrypt(value.encode()).decode()
    
    def to_python(self, value):
        return value
    
    def get_prep_value(self, value):
        if value is None:
            return value
        cipher_suite = self._get_cipher_suite()
        return cipher_suite.encrypt(value.encode()).decode()

