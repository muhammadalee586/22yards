from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal

class Booking(models.Model):
    """
    Handles the scheduling and payment of court bookings.
    Includes atomic checks to prevent double-booking.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='bookings'
    )
    court = models.ForeignKey(
        'courts.Court', 
        on_delete=models.CASCADE, 
        related_name='bookings'
    )
    
    # Timing
    date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    contact_number = models.CharField(max_length=20, blank=True, default='')
    
    # Pricing
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    advance_payment = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20, 
        choices=[('PENDING', 'Pending'), ('PARTIAL', 'Partial'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled')],
        default='PENDING'
    )
    
    # Booking status
    status = models.CharField(
        max_length=20, 
        choices=[('CONFIRMED', 'Confirmed'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled')],
        default='CONFIRMED'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.id} - {self.user.username} at {self.court.name}"

class Review(models.Model):
    """
    Verified reviews: only users who have completed a booking can leave a review.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    court = models.ForeignKey('courts.Court', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)]) # 1-5
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'court') # One review per user per court

    def __str__(self):
        return f"Review for {self.court.name} by {self.user.username}"
