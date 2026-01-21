from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        ('api_key', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ChatSession',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(blank=True, max_length=255)),
                ('messages', models.JSONField(blank=True, default=list)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('RUNNING', 'Running'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed')], default='PENDING', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('account_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_session', to='accounts.account')),
            ],
            options={
                'db_table': 'chat_session',
                'verbose_name': 'Chat Session',
                'verbose_name_plural': 'Chat Sessions',
            },
        ),
        migrations.CreateModel(
            name='AiRequest',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('message', models.TextField()),
                ('response', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('RUNNING', 'Running'), ('COMPLETED', 'Completed'), ('FAILED', 'Failed')], default='PENDING', max_length=20)),
                ('response_engine', models.IntegerField(blank=True, choices=[(1, 'GEMINI_3_FLASH'), (2, 'GEMINI_2_5_FLASH'), (3, 'GEMINI_2_5_FLASH_LITE'), (4, 'GEMMA_3_27B')], null=True)),
                ('response_style', models.CharField(choices=[('SUPPORTIVE', 'Supportive'), ('CASUAL', 'Casual'), ('DEEP', 'Deep')], max_length=20, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('account_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_bot', to='accounts.account')),
                ('session', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='chat_bot.chatsession')),
            ],
            options={
                'db_table': 'chat_bot_airequest',
                'verbose_name': 'AI Request',
                'verbose_name_plural': 'AI Requests',
            },
        ),
    ]
