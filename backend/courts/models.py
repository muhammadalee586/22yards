from django.db import models
from django.conf import settings

def default_operating_days():
    return ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

class Court(models.Model):
    """
    Represents an indoor cricket court.
    Linked to an Owner (User) for RBAC management.
    """
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='courts'
    )
    name = models.CharField(max_length=255)
    description = models.TextField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    opening_time = models.TimeField(default='06:00')
    closing_time = models.TimeField(default='23:00')
    operating_days = models.JSONField(default=default_operating_days, blank=True)

    # Visuals
    main_image = models.ImageField(upload_to='courts/main/')
    gallery = models.JSONField(default=list, blank=True) # Store multiple image paths
    
    # Features
    has_ac = models.BooleanField(default=False)
    has_parking = models.BooleanField(default=False)
    turf_type = models.CharField(
        max_length=50, 
        choices=[('ASTROTURF', 'AstroTurf'), ('CARPET', 'Carpet'), ('WOOD', 'Wood')],
        default='ASTROTURF'
    )
    
    # Ratings
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.city}"

class CourtImage(models.Model):
    """
    Separate model for court gallery to maintain database normalization.
    """
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='courts/gallery/')
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.court.name}"
