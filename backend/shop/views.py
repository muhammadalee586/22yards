from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Category, Product, Order, OrderItem
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer, OrderCreateSerializer
from core.permissions import IsAdminOrReadOnly, IsOwnerRoleOrReadOnly, IsAdminRole
from decimal import Decimal

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        # For non-admins, list only available products
        user = self.request.user
        if not user or not user.is_authenticated or getattr(user, 'role', None) != 'ADMIN':
            return Product.objects.filter(is_available=True)
        return super().get_queryset()

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = Product.objects.filter(is_featured=True, is_available=True)
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Order.objects.none()
        if getattr(user, 'role', None) == 'ADMIN':
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        # 1. Validate input using OrderCreateSerializer
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # 2. Process order atomically
        try:
            with transaction.atomic():
                cart_items = validated_data['items']
                total_amount = Decimal('0.00')
                order_items_to_create = []

                for item in cart_items:
                    p_id = item['product_id']
                    qty = int(item['quantity'])
                    
                    # Lock product row to prevent race conditions on stock
                    product = Product.objects.select_for_update().get(pk=p_id)
                    
                    if not product.is_available:
                        return Response({"detail": f"Product {product.name} is currently unavailable."}, status=status.HTTP_400_BAD_REQUEST)
                    
                    if product.stock < qty:
                        return Response({"detail": f"Insufficient stock for {product.name}. Available: {product.stock}"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Calculate price
                    unit_price = product.price
                    total_amount += unit_price * qty
                    
                    # Stage OrderItem and decrement stock
                    order_items_to_create.append(OrderItem(
                        product=product,
                        quantity=qty,
                        unit_price=unit_price
                    ))
                    product.stock -= qty
                    product.save()

                # Create the Order
                order = Order.objects.create(
                    user=request.user,
                    shipping_address=validated_data['shipping_address'],
                    total_amount=total_amount
                )

                # Bulk create OrderItems
                for oi in order_items_to_create:
                    oi.order = order
                    oi.save()

                return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except Product.DoesNotExist:
            return Response({"detail": "One or more products not found."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def mark_paid(self, request, pk=None):
        order = self.get_object()
        order.payment_status = 'PAID'
        order.save()
        return Response({'status': 'Order marked as PAID.'})
