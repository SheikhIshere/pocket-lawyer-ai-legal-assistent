# location : backend/accounts/models.py

# core
from django.db import models

# user model
from django.contrib.auth import get_user_model
User = get_user_model()

# choice
from BASE.base_choice import (
    StatusChoice,
    GenderChoice,
    AccountPlanChoice,
    LanguageChoice,
)
# base model
from BASE.base_model import BaseModel

class Account(BaseModel):
    # user connection
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account')
    
    # user info
    full_name = models.CharField(max_length=100, blank=True)
    gender = models.CharField(max_length=10, choices=GenderChoice.choices, default=GenderChoice.OTHER)
    birth_day = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)

    # chat bot language preference
    language = models.CharField(max_length=10, choices=LanguageChoice.choices, default=LanguageChoice.ENGLISH)

    # admin only
    status = models.CharField(max_length=10, choices=StatusChoice.choices, default=StatusChoice.ACTIVE)
    plan = models.CharField(max_length=10, choices=AccountPlanChoice.choices, default=AccountPlanChoice.FREE)
    credit = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f'{self.full_name} : {self.user.email}'

class AccountAddress(BaseModel):
    # account connection
    account = models.OneToOneField(Account, on_delete=models.CASCADE, related_name='address')
    
    # address info
    street = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=100)

    def __str__(self):
        return f'{self.account.user.email} from: {self.country} living at {self.city}'