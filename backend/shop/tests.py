from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from shop.models import Category, Product
from shop.serializers import OrderSerializer

User = get_user_model()

class ShopPermissionTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(username='admin', password='password', role='ADMIN')
        self.regular_user = User.objects.create_user(username='user', password='password', role='USER')
        
        self.category = Category.objects.create(name="Bats", slug="bats")
        self.product = Product.objects.create(
            name="Premium Bat",
            category=self.category,
            price=15000,
            stock=10,
            is_available=True
        )

    def test_anonymous_get_products(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_cannot_create_category(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {'name': 'New Cat', 'slug': 'new-cat'}
        response = self.client.post('/api/categories/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_category(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'name': 'New Cat', 'slug': 'new-cat'}
        response = self.client.post('/api/categories/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_cannot_patch_product(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {'price': 100}
        response = self.client.patch(f'/api/products/{self.product.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_patch_product(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'price': 100}
        response = self.client.patch(f'/api/products/{self.product.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_cannot_set_payment_status(self):
        # This test checks the serializer read_only_fields
        from shop.models import Order
        order = Order.objects.create(user=self.regular_user, total_amount=1000, shipping_address="test")
        
        self.client.force_authenticate(user=self.regular_user)
        data = {'payment_status': 'PAID'}
        response = self.client.patch(f'/api/orders/{order.id}/', data)
        
        # Refresh from DB
        order.refresh_from_db()
        self.assertNotEqual(order.payment_status, 'PAID')
