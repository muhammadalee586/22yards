from django.contrib import admin
from .models import Booking, Review

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'court', 'date', 'start_time', 'end_time', 'status', 'payment_status', 'total_price')
    list_filter = ('status', 'payment_status', 'date')
    search_fields = ('user__username', 'court__name')
    date_hierarchy = 'date'

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('court', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('court__name', 'user__username', 'comment')

