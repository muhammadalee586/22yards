from django.test import TestCase
from django.core import mail
from django.contrib.auth import get_user_model, authenticate
from rest_framework.test import APITestCase
from rest_framework import status
from allauth.account.forms import default_token_generator
from allauth.account.utils import user_pk_to_url_str

User = get_user_model()

class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='cricketer',
            email='cricketer@22yards.com',
            password='OldPassword123!'
        )

    def test_password_reset_request_sends_email_with_frontend_url(self):
        response = self.client.post('/api/auth/password/reset/', {
            'email': 'cricketer@22yards.com'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

        email = mail.outbox[0]
        self.assertIn('cricketer@22yards.com', email.to)
        # Verify the reset link points directly to the Next.js frontend
        self.assertIn('/reset-password/confirm?uid=', email.body)
        self.assertIn('&token=', email.body)

    def test_password_reset_confirm_flow(self):
        token = default_token_generator.make_token(self.user)
        uid = user_pk_to_url_str(self.user)

        response = self.client.post('/api/auth/password/reset/confirm/', {
            'uid': uid,
            'token': token,
            'new_password1': 'BrandNewPass123!',
            'new_password2': 'BrandNewPass123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify old password no longer works
        self.assertIsNone(authenticate(username='cricketer', password='OldPassword123!'))

        # Verify new password works
        authenticated_user = authenticate(username='cricketer', password='BrandNewPass123!')
        self.assertIsNotNone(authenticated_user)

    def test_password_reset_confirm_redirect_fallback(self):
        token = 'sample-token-123'
        uid = '2'
        response = self.client.get(f'/password-reset/confirm/{uid}/{token}/')
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn('/reset-password/confirm?uid=2&token=sample-token-123', response.url)

    def test_login_with_username_and_email(self):
        # 1. Login with username
        res_user = self.client.post('/api/auth/login/', {
            'username': 'cricketer',
            'password': 'OldPassword123!'
        })
        self.assertEqual(res_user.status_code, status.HTTP_200_OK)
        self.assertIn('access', res_user.data)
        self.assertIn('user', res_user.data)

        # 2. Login with email
        res_email = self.client.post('/api/auth/login/', {
            'username': 'cricketer@22yards.com',
            'password': 'OldPassword123!'
        })
        self.assertEqual(res_email.status_code, status.HTTP_200_OK)
        self.assertIn('access', res_email.data)
        self.assertEqual(res_email.data['user']['username'], 'cricketer')

    def test_registration_and_login_flow(self):
        reg_res = self.client.post('/api/auth/registration/', {
            'username': 'allrounder',
            'email': 'allrounder@22yards.com',
            'password1': 'StrongSecret123!',
            'password2': 'StrongSecret123!',
            'role': 'USER'
        })
        self.assertEqual(reg_res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', reg_res.data)

        # Login with email of newly registered user
        login_res = self.client.post('/api/auth/login/', {
            'username': 'allrounder@22yards.com',
            'password': 'StrongSecret123!'
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

