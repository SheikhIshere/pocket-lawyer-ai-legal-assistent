from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat_bot", "0002_alter_airequest_response_engine"),
    ]

    operations = [
        migrations.AddField(
            model_name="chatsession",
            name="case_state",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
