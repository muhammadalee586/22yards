from rest_framework import serializers
from .models import Category, Product, Order, OrderItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price']

class OrderCreateSerializer(serializers.Serializer):
    """
    Specialized serializer for creating orders to validate the cart structure.
    """
    shipping_address = serializers.CharField(required=True, allow_blank=False)
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        max_length=50
    )

    def validate_items(self, value):
        # Check for duplicates, missing fields, and positive quantity
        seen_products = set()
        for item in value:
            p_id = item.get('product_id')
            qty = item.get('quantity')
            
            if p_id is None or qty is None:
                raise serializers.ValidationError("Each item must have a product_id and quantity.")
            
            try:
                qty = int(qty)
                if qty < 1:
                    raise ValueError()
            except (ValueError, TypeError):
                raise serializers.ValidationError(f"Invalid quantity for product {p_id}. Must be at least 1.")
            
            if p_id in seen_products:
                raise serializers.ValidationError(f"Duplicate product_id: {p_id}. Please merge quantities.")
            seen_products.add(p_id)
            
        return value

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_amount', 'payment_status', 'shipping_address', 'items', 'total_items', 'created_at']
        read_only_fields = ('user', 'total_amount', 'payment_status')
