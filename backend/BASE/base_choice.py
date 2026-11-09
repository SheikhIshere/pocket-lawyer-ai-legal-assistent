# location: backend/BASE/base_choice.py
from django.db.models import TextChoices, IntegerChoices


# for: backend/accounts/models.py
class StatusChoice(TextChoices):
    ACTIVE = 'active', 'Active'
    SUSPENDED = 'suspended', 'Suspended'
    BAN = 'ban', 'Ban'

class GenderChoice(TextChoices):
    MALE = 'male', 'Male'
    FEMALE = 'female', 'Female'
    OTHER = 'other', 'Other'

class AccountPlanChoice(TextChoices):
    FREE = 'free', 'Free'
    PRO = 'pro', 'Pro'
    PREMIUM = 'premium', 'Premium'
    
class LanguageChoice(TextChoices):
    ENGLISH = 'english', 'English'
    BANGLA = 'bangla', 'Bangla'



# for: backend/api_key/models.py
# for: backend/chat_bot/models.py
class CeleryStatus(TextChoices):
    PENDING = 'PENDING', 'Pending'
    RUNNING = 'RUNNING', 'Running'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'


# for: backend/chat_bot/models.py
class ChatEngine(IntegerChoices):
    """ types of gemini models i am using to response """
    # NOTE: constant names are kept for backward compatibility. The labels below are
    # the model IDs currently available to new Google AI Studio API keys.
    """
    1 will be gemini-3-flash-preview
    2 will be gemini-3.5-flash
    3 will be gemini-3.5-flash-lite
    4 will be gemini-3.8-flash
    """
    GEMINI_3_FLASH = 1, "gemini-3-flash-preview"
    GEMINI_2_5_FLASH = 2, "gemini-3.5-flash"
    GEMINI_2_5_FLASH_LITE = 3, "gemini-3.5-flash-lite"
    GEMMA_3_27B = 4, "gemini-3.8-flash"

# for: backend/chat_bot/models.py
class ModelStyle(TextChoices):
    """ types of character styles i am using to response """
    SUPPORTIVE = "supportive", "Supportive"
    CASUAL = "casual", "Casual"
    """     
    THOUGHT : if user provide multiple usable api
              i can with one i can display random talk
              one will take the lead and make the whole task
              into chunks and distributed among all api 
              powered ai engin and if all successfully 
              done their process one ai will take all of
              the raw out put and marge and polish it
              this can be done with high level engin
              so there is a change i will include it
              inside premium but few will for free plan
              as well
    """    
    DEEP_THINKING = "deep_thinking", "Deep_thinking" # special approach
    
    # up coming
    # PURAN_DHAKAIYA = "puran_dhakaiya", "Puran_dhakaiya"


# for: backend/contact_us/models.py
class ServiceType(TextChoices):
    GENERAL_INQUIRY = "general_inquiry", "General_Inquiry"
    DOCUMENT_REVIEW = "document_review", "Document_Review"
    EMERGENCY_LEGAL_HELP = "emergency_legal_help", "Emergency_Legal_Help"
    LEGAL_ADVICE = "legal_advice", "Legal_Advice"
    LEGAL_RESEARCH = "legal_research", "Legal_Research"
    BUG_REPORT = "bug_report", "Bug_Report"
    OTHER = "other", "Other"

class PriorityLevel(TextChoices):
    NORMAL = "normal", "Normal"
    URGENT = "urgent", "Urgent" 
    EMERGENCY = "emergency" , "Emergency"