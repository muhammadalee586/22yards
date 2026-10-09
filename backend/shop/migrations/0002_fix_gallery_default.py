# Generated manually to fix gallery field default

from django.db import migrations


def set_gallery_default(apps, schema_editor):
    """Set empty list for any products with NULL gallery"""
    Product = apps.get_model('shop', 'Product')
    Product.objects.filter(gallery__isnull=True).update(gallery=[])


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(set_gallery_default, migrations.RunPython.noop),
    ]
