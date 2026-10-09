# Generated manually to properly set gallery field with default

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0002_fix_gallery_default'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='gallery',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
