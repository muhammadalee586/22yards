from django.contrib import admin
from .models import Court, CourtImage

@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'price_per_hour', 'owner')
    search_fields = ('name', 'city')
    list_filter = ('city', 'turf_type')

@admin.register(CourtImage)
class CourtImageAdmin(admin.ModelAdmin):
    list_display = ('court', 'is_primary')
