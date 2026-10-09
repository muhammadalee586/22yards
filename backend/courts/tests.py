from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from courts.models import Court

User = get_user_model()

class CourtPermissionTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(username='admin', password='password', role='ADMIN')
        self.owner_user = User.objects.create_user(username='owner', password='password', role='OWNER')
        self.regular_user = User.objects.create_user(username='user', password='password', role='USER')
        
        self.court = Court.objects.create(
            name="Central Arena",
            city="Lahore",
            price_per_hour=1000,
            owner=self.owner_user
        )

    def test_anonymous_get_courts(self):
        response = self.client.get('/api/courts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_cannot_create_court(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {'name': 'User Court', 'city': 'Karachi', 'price_per_hour': 500}
        response = self.client.post('/api/courts/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_create_court(self):
        self.client.force_authenticate(user=self.owner_user)
        # Valid 1x1 GIF
        gif_content = (
            b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff'
            b'\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00'
            b'\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        )
        image = SimpleUploadedFile("test_image.gif", gif_content, content_type="image/gif")
        data = {
            'name': 'Owner Court', 
            'city': 'Karachi', 
            'price_per_hour': '500.00',
            'description': 'A great court',
            'address': 'Street 1, Karachi',
            'turf_type': 'ASTROTURF',
            'main_image': image
        }
        response = self.client.post('/api/courts/', data)
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Error response: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_non_owner_cannot_delete_court(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.delete(f'/api/courts/{self.court.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_court(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/courts/{self.court.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
