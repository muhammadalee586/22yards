import os
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model for 22 Yards.
    Extends AbstractUser to include roles for RBAC (Role-Based Access Control).
    """
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        OWNER = 'OWNER', 'Ground Owner'
        USER = 'USER', 'Customer'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER,
    )
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
