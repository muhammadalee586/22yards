from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from courts.models import Court
from bookings.models import Booking, Review

User = get_user_model()

class BookingPermissionTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(username='admin', password='password', role='ADMIN')
        self.owner_user = User.objects.create_user(username='owner', password='password', role='OWNER')
        self.regular_user = User.objects.create_user(username='user', password='password', role='USER')
        
        self.court = Court.objects.create(
            name="Main Arena",
            city="Lahore",
            price_per_hour=1000,
            owner=self.owner_user
        )
        
        self.booking = Booking.objects.create(
            user=self.regular_user,
            court=self.court,
            date="2026-10-10",
            start_time="10:00",
            end_time="11:00",
            total_price=1000.00,
            advance_payment=200.00,
            status='CONFIRMED'
        )
        
        self.review = Review.objects.create(
            user=self.regular_user,
            court=self.court,
            rating=5,
            comment="Great!"
        )

    def test_anonymous_bookings_401(self):
        response = self.client.get('/api/bookings/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_cannot_edit_others_review(self):
        other_user = User.objects.create_user(username='other', password='password', role='USER')
        self.client.force_authenticate(user=other_user)
        
        data = {'rating': 1, 'comment': 'Bad!'}
        response = self.client.patch(f'/api/reviews/{self.review.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_edit_own_review(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {'rating': 4, 'comment': 'Still good'}
        response = self.client.patch(f'/api/reviews/{self.review.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
