# Generated for the live model picker.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat_bot', '0005_airequest_progress'),
    ]

    operations = [
        migrations.AddField(
            model_name='airequest',
            name='response_model',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]
